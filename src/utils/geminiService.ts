import {
	GoogleGenAI,
	Content,
} from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY; // Ensure this is set in your .env.local or Vercel env vars

if (!API_KEY) {
	console.warn(
		"GEMINI_API_KEY is not set. AI features will not work. Please set it in your environment variables."
	);
}

// Initialize the GoogleGenAI client with API key
// This instance can be reused.
const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const GEMINI_MODEL_NAME = "gemini-2.0-flash";

interface StreamGeminiResponseParams {
	prompt: string | Content | (string | Content)[]; // Allow flexible prompt types
	onChunk: (text: string) => void;
	onError: (error: Error) => void;
	onComplete: () => void;
	abortSignal?: AbortSignal;
}

/**
 * Generates content from the Gemini API and streams the response.
 * This is a server-side utility.
 */
export async function streamGeminiResponse({
	prompt,
	onChunk,
	onError,
	onComplete,
	abortSignal,
}: StreamGeminiResponseParams): Promise<void> {
	if (!genAI) {
		onError(new Error("Gemini API client is not initialized. Check API_KEY."));
		onComplete();
		return;
	}

	try {
		const model = genAI.models;
		const generationConfig = {
			temperature: 1, // Example: Adjust creativity
			topP: 0.95,
			maxOutputTokens: 2048, // Example: Limit output length
		};

		// The `contents` field expects an array of Content objects.
		// If a simple string prompt is given, wrap it appropriately.
		let requestContents: Content[];
		if (typeof prompt === "string") {
			requestContents = [{ role: "user", parts: [{ text: prompt }] }];
		} else if (Array.isArray(prompt)) {
			requestContents = prompt.map((p) =>
				typeof p === "string" ? { role: "user", parts: [{ text: p }] } : p
			);
		} else {
			// Single Content object
			requestContents = [prompt];
		}

		const stream = await model.generateContentStream({
			model: GEMINI_MODEL_NAME,
			contents: requestContents,
			config: generationConfig,
		});

		for await (const chunk of stream) {
			if (abortSignal?.aborted) {
				// console.log("Gemini stream aborted by client.");
				// The error will be thrown by the fetch mechanism on the client side
				// or handled by the ReadableStream controller.
				// No explicit error needs to be thrown here for the stream to stop.
				break;
			}
			const text = chunk.text;
			if (text) {
				onChunk(text);
			}
		}
	} catch (error) {
		console.error("Error streaming Gemini response:", error);
		if (error instanceof Error) {
			onError(error);
		} else {
			onError(new Error("Unknown error during Gemini stream."));
		}
	} finally {
		onComplete();
	}
}

// --- Prompt Engineering Functions ---

export function createSimilarQuestionsPrompt(
	currentQuestionContent: string,
	existingQuestionsContext?: string // Optional: context of other questions in the group
): string {
	// Simplified prompt for finding similar questions.
	// The AI should focus on semantic similarity.
	// This prompt might be better handled by embedding techniques + vector search for large scale,
	// but for a direct LLM approach:
	return `
Context:
You are an AI assistant helping users find questions similar to one they are interested in.
The goal is to identify questions that cover the same topic, ask about related concepts, or seek similar information.

Current Question:
"${currentQuestionContent}"

${
	existingQuestionsContext
		? `
Consider these other questions from the same space for context (do not suggest these exact ones unless they are truly the most similar and distinct from the current one):
${existingQuestionsContext}
`
		: ""
}

Task:
Based *only* on the "Current Question", generate 3 distinct questions that are semantically similar or closely related to it.
The generated questions should be phrased naturally, as if a user asked them.
Output each question on a new line. Do not number them or add any other text.
Ensure the generated questions are in the same language as the "Current Question".
`;
}

export function createGenerateQuestionPrompt(
	topic: string,
	existingUserQuestion?: string | null
): string {
	// Using a structure similar to your original createGeminiPrompt
	const promptTemplate = `
**Role:** You are an AI assistant specialized in question generation.

**Objective:**
Generate a single, concise, and relevant question about a given topic.
If an \`[EXISTING_USER_QUESTION]\` is provided, your new question should aim to be an improvement, refinement, a deeper dive, or a logical follow-up to it, while still being related to the \`[TOPIC]\`.

**Instructions:**

1.  You will receive a \`[TOPIC]\` as input.
2.  You *may* also receive an \`[EXISTING_USER_QUESTION]\`.
3.  Based on these inputs, formulate **one new insightful question**.
4.  **If \`[EXISTING_USER_QUESTION]\` is provided and is not "None provided.":**
    *   Analyze the \`[EXISTING_USER_QUESTION]\`.
    *   Generate a *new* question that builds upon it, makes it more specific, explores a related nuance, or asks a more advanced/probing question on the same sub-theme.
    *   Do NOT simply rephrase the \`[EXISTING_USER_QUESTION]\` unless the rephrasing significantly improves clarity, focus, or depth.
    *   Your generated question should still clearly relate to the main \`[TOPIC]\`.
5.  **If \`[EXISTING_USER_QUESTION]\` is "None provided." or absent:**
    *   Generate a general insightful question about the \`[TOPIC]\`.
6.  **Language Strictness (Crucial):** The generated question MUST be in the *exact same language* as the provided \`[TOPIC]\`.
7.  **Conciseness:** The new question should be 1-2 sentences long.
8.  **Output:** Provide *only* the newly generated question, without any additional preamble or explanation.

**Input:**

Topic: \`{{TOPIC_PLACEHOLDER}}\`
Existing User Question: \`{{EXISTING_QUESTION_PLACEHOLDER}}\`

**Your Generated Question:**
`;
	let finalPrompt = promptTemplate.replace("{{TOPIC_PLACEHOLDER}}", topic);
	finalPrompt = finalPrompt.replace(
		"{{EXISTING_QUESTION_PLACEHOLDER}}",
		existingUserQuestion && existingUserQuestion.trim() !== ""
			? existingUserQuestion
			: "None provided."
	);
	return finalPrompt;
}

export function createGenerateAnswerPrompt(
	questionContent: string,
	context?: string
): string {
	return `
**Role:** You are a helpful AI assistant.

**Objective:**
Provide a comprehensive, clear, and helpful answer to the given \`[QUESTION]\`.
If \`[ADDITIONAL_CONTEXT]\` is provided, use it to enhance the relevance and accuracy of your answer.

**Instructions:**

1.  Analyze the \`[QUESTION]\` thoroughly.
2.  If \`[ADDITIONAL_CONTEXT]\` is available, consider it to tailor your response.
3.  Formulate a helpful and informative answer.
4.  The answer should be well-structured and easy to understand.
5.  Maintain the language of the original \`[QUESTION]\`. Do not translate.
6.  **Output:** Provide *only* the answer text, without any preamble like "Here's an answer:".

**Input:**

Question:
\`${questionContent}\`

${
	context && context.trim() !== ""
		? `
Additional Context:
\`${context}\`
`
		: ""
}

**Your Answer:**
`;
}
