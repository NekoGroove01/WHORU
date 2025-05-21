import { streamGeminiResponse } from "@/utils/geminiService"; // Adjusted path

export function createStreamingResponse(
	prompt: string,
	requestAbortSignal: AbortSignal
): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	let streamController: ReadableStreamDefaultController<Uint8Array>;

	const readableStream = new ReadableStream<Uint8Array>({
		start(controller) {
			streamController = controller;
			// TODO: Implement AI Usage Tracking Check here
			// If usage limit exceeded, controller.error(new Error("Usage limit exceeded")); return;

			streamGeminiResponse({
				prompt,
				onChunk: (text) => {
					try {
						controller.enqueue(encoder.encode(text));
					} catch (e) {
						// Handle potential errors if the stream is already closed, though abortSignal should prevent this.
						console.warn(
							"Error enqueuing chunk after stream might have closed:",
							e
						);
					}
				},
				onError: (error: unknown) => {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
					console.error("Gemini stream error:", errorMessage);
					try {
						// Send an error message through the stream if possible, or just close it.
						const errorMessage = `\n[[ERROR: ${error}]]\n`;
						controller.enqueue(encoder.encode(errorMessage));
						controller.error(error);
					} catch (e) {
						console.warn(
							"Error sending error message to stream controller:",
							e
						);
						// Controller might already be closed or in an error state.
					}
				},
				onComplete: () => {
					try {
						controller.close();
					} catch (e) {
						console.warn(
							"Error closing stream controller, it might already be closed:",
							e
						);
						// Controller might already be closed.
					}
				},
				abortSignal: requestAbortSignal, // Pass the AbortSignal from the NextRequest
			});
		},
		cancel(reason) {
			// This is called if the client aborts the fetch request.
			// The abortSignal in streamGeminiResponse should handle stopping the Gemini call.
			console.log("Stream cancelled by client:", reason);
		},
	});

	return readableStream;
}
