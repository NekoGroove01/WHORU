import { GoogleGenAI, Content } from "@google/genai";
import { Question } from "@/types/schemas/question";

// Initialize Gemini client
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
	console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const MODEL_NAME = "gemini-2.0-flash";

// Token estimation constants
const CHARS_PER_TOKEN = 4;
const COST_PER_TOKEN = 0.000001;

interface StreamConfig {
	onChunk: (text: string) => void;
	onError: (error: Error) => void;
	onComplete: (tokensUsed: number, cost: number) => void;
	abortSignal?: AbortSignal;
}

// Stream response handler
async function streamGeminiResponse(
	prompt: string | Content | Content[],
	config: StreamConfig
): Promise<void> {
	if (!genAI) {
		config.onError(new Error("Gemini API client not initialized"));
		config.onComplete(0, 0);
		return;
	}

	let totalChars = 0;

	try {
		// Prepare contents
		let contents: Content[];
		if (typeof prompt === "string") {
			contents = [{ role: "user", parts: [{ text: prompt }] }];
		} else if (Array.isArray(prompt)) {
			contents = prompt;
		} else {
			contents = [prompt];
		}

		// Stream generation
		const stream = await genAI.models.generateContentStream({
			model: MODEL_NAME,
			contents,
			config: {
				temperature: 0.7,
				topP: 0.95,
				maxOutputTokens: 2048,
			},
		});

		// Process stream
		for await (const chunk of stream) {
			if (config.abortSignal?.aborted) break;

			const text = chunk.text;
			if (text) {
				totalChars += text.length;
				config.onChunk(text);
			}
		}

		// Calculate tokens and cost
		const tokensUsed = Math.ceil(totalChars / CHARS_PER_TOKEN);
		const cost = tokensUsed * COST_PER_TOKEN;

		config.onComplete(tokensUsed, cost);
	} catch (error) {
		console.error("Gemini streaming error:", error);
		config.onError(error instanceof Error ? error : new Error("Unknown error"));
		config.onComplete(0, 0);
	}
}

// Generate questions with streaming
export async function generateQuestionsStream(
	topic: string,
	context: string | undefined,
	count: number,
	config: StreamConfig
): Promise<void> {
	const prompt = `Generate ${count} thoughtful questions about "${topic}".
${context ? `Context: ${context}` : ""}

Format each question as JSON with "title" (short, 1-2 sentences) and "content" (detailed explanation).
Make questions open-ended and thought-provoking.

Response format: 
[{"title": "...", "content": "..."}, ...]`;

	await streamGeminiResponse(prompt, config);
}

// Generate answer with streaming
export async function generateAnswerStream(
	questionContent: string,
	questionTitle: string,
	additionalContext: string | undefined,
	config: StreamConfig
): Promise<void> {
	const prompt = createGenerateAnswerPrompt(
		`${
			questionTitle ? `Title: ${questionTitle}\n` : ""
		}Question: ${questionContent}`,
		additionalContext
	);

	await streamGeminiResponse(prompt, config);
}

// Find similar questions (non-streaming due to JSON parsing requirement)
export async function findSimilarQuestions(
	queryText: string,
	questions: Question[],
	limit: number = 5
): Promise<{
	questions: Question[];
	tokensUsed: number;
	cost: number;
}> {
	if (!genAI) {
		throw new Error("Gemini API client not initialized");
	}

	const questionsContext = questions
		.slice(0, 20) // Limit context size
		.map((q, i) => `${i + 1}. ${q.title || q.content.substring(0, 100)}`)
		.join("\n");

	const prompt = createSimilarQuestionsPrompt(queryText, questionsContext);

	const response = await genAI.models.generateContent({
		model: MODEL_NAME,
		contents: prompt,
		config: {
			temperature: 0.3,
			maxOutputTokens: 500,
		},
	});

	const text = response.text;
	if (!text) {
		throw new Error("No response text received from Gemini API");
	}

	// Parse similar question indices from response
	const lines = text.trim().split("\n").filter(Boolean);
	const similarQuestions: Question[] = [];

	for (const line of lines.slice(0, limit)) {
		// Try to find matching question in original list
		const matchedQuestion = questions.find(
			(q) =>
				(q.title && line.includes(q.title)) ||
				line.includes(q.content.substring(0, 50))
		);
		if (matchedQuestion) {
			similarQuestions.push(matchedQuestion);
		}
	}

	const tokensUsed = Math.ceil(text.length / CHARS_PER_TOKEN);
	const cost = tokensUsed * COST_PER_TOKEN;

	return { questions: similarQuestions, tokensUsed, cost };
}

// Prompt engineering functions
function createGenerateAnswerPrompt(
	questionContent: string,
	context?: string
): string {
	return `**Role:** You are a helpful AI assistant.

**Objective:**
Provide a comprehensive, clear, and helpful answer to the given question.
${context ? "Use the additional context to enhance your answer." : ""}

**Instructions:**
1. Analyze the question thoroughly.
2. Provide a well-structured and informative answer.
3. Use clear, easy-to-understand language.
4. Include relevant examples if helpful.
5. Maintain the same language as the question.

**Question:**
${questionContent}

${context ? `**Additional Context:**\n${context}` : ""}

**Your Answer:**`;
}

function createSimilarQuestionsPrompt(
	currentQuestion: string,
	existingQuestionsContext?: string
): string {
	return `You are an AI assistant helping find similar questions.

**Current Question:**
"${currentQuestion}"

${
	existingQuestionsContext
		? `**Existing Questions:**\n${existingQuestionsContext}`
		: ""
}

**Task:**
Generate 3-5 questions that are semantically similar or related to the current question.
- Questions should explore similar topics or concepts
- Each question should be distinct and naturally phrased
- Output one question per line
- Use the same language as the current question`;
}

/**
 * Usage Examples:
 *
 * // Stream question generation
 * await generateQuestionsStream(
 *   "React performance",
 *   "For e-commerce apps",
 *   3,
 *   {
 *     onChunk: (text) => console.log(text),
 *     onError: (error) => console.error(error),
 *     onComplete: (tokens, cost) => console.log(`Used ${tokens} tokens, cost: $${cost}`),
 *   }
 * );
 *
 * // Stream answer generation
 * await generateAnswerStream(
 *   "How to optimize React re-renders?",
 *   "React Performance",
 *   "Using React 18",
 *   {
 *     onChunk: (text) => response.write(text),
 *     onError: (error) => response.end(),
 *     onComplete: (tokens, cost) => logUsage(tokens, cost),
 *   }
 * );
 */
