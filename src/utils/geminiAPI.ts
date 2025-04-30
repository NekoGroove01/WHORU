import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client with API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

// Gemini API models
const models: Record<string, string> = {
	"flash-2.0": "gemini-2.0-flash",
	"flash-2.5-exp": "models/gemini-2.5-flash-preview-04-17",
};

const prompts: Record<number, string> = {
	0: "You are a helpful assistant. Answer the question: {question}",
	1: "You are a helpful assistant. Answer the question: {question}",
};

/**
 * Fetches a response from the Gemini API. Used to generate answers to questions.
 * @param question base questions
 * @param input user inputs, it can be null
 * @param prompt prompt type, default is 0
 * @param onChunk callback function to handle each chunk of text as it arrives
 */
export default async function fetchGeminiResponse(
	question: string,
	input: string | null,
	prompt: number = 0,
	onChunk?: (text: string) => void,
	abortSignal?: AbortSignal
) {
	try {
		const response = await ai.models.generateContentStream({
			model: models["flash-2.0"],
			contents: prompts[prompt]
				.replace("{question}", question)
				.replace("{input}", input ?? "none"),
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
