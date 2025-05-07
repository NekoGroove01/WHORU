"use client";

import { GoogleGenAI } from "@google/genai";

// Gemini API models
const models: Record<string, string> = {
	"flash-2.0": "gemini-2.0-flash",
	"flash-2.5-exp": "gemini-2.5-flash-preview-04-17",
};

const API_KEY: string = process.env.GEMINI_API ?? "";

/**
 * Fetches a response from the Gemini API. Used to generate answers to questions.
 * @param input The input string to send to the API.
 * @param userInput The user's input string, if any.
 * @param promptType The type of prompt to use (default is 0).
 * @param onChunk Optional callback function to handle streaming chunks of text.
 * @param abortSignal Optional AbortSignal to cancel the request.
 * @returns A promise that resolves to the full response text.
 */
export default async function fetchGeminiResponse(
	input: string,
	userInput: string | null,
	promptType: number = 0,
	onChunk?: (text: string) => void,
	abortSignal?: AbortSignal
) {
	console.log("Fetching Gemini response...");

	// Initialize the GoogleGenAI client with API key
	const ai = new GoogleGenAI({ apiKey: API_KEY });

	let convertedInput: string = "";

	if (promptType === 1) {
		convertedInput = input;
	} else {
		convertedInput = createGeminiPrompt(input, userInput);
	}

	try {
		const response = await ai.models.generateContentStream({
			model: models["flash-2.0"],
			contents: convertedInput,
		});

		let fullText = "";

		for await (const chunk of response) {
			// Check if aborted before processing each chunk
			if (abortSignal?.aborted) {
				throw new DOMException("Aborted", "AbortError");
			}

			// Add the new chunk to the accumulated text
			fullText += chunk.text;

			// If a callback is provided, call it with each chunk
			if (onChunk) {
				onChunk(chunk.text ?? "");
			} else {
				console.log(chunk.text);
			}
		}

		// Return the complete response
		return fullText;
	} catch (error) {
		console.error("Error generating content:", error);
		throw error;
	}
}

function createGeminiPrompt(topic: string, userQuestion: string | null = null) {
	// The base prompt template
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
    *   For example:
        *   If \`[TOPIC]\` is "The impact of social media on teenagers" (English), your question must be in English.
        *   If \`[TOPIC]\` is "기후 변화의 영향" (Korean), your question must be in Korean.
    *   Do NOT translate the topic or any part of the input. Maintain the input language strictly.
7.  **Conciseness:** The new question should be 1-2 sentences long.
8.  **Output:** Provide *only* the newly generated question, without any additional preamble or explanation.

**Input:**

Topic: \`{{TOPIC_PLACEHOLDER}}\`
Existing User Question: \`{{EXISTING_QUESTION_PLACEHOLDER}}\`

**Your Generated Question:**
`;

	// Replace the topic placeholder
	let finalPrompt = promptTemplate.replace("{{TOPIC_PLACEHOLDER}}", topic);

	// Handle the existing user question
	if (userQuestion && userQuestion.trim() !== "") {
		finalPrompt = finalPrompt.replace(
			"{{EXISTING_QUESTION_PLACEHOLDER}}",
			userQuestion
		);
	} else {
		finalPrompt = finalPrompt.replace(
			"{{EXISTING_QUESTION_PLACEHOLDER}}",
			"None provided."
		);
	}

	return finalPrompt;
}
