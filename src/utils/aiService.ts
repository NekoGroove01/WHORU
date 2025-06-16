// Client-side AI API service
export interface GenerationResponse {
	text: string;
	usage: {
		tokensUsed: number;
		cost: number;
	};
}

export interface SimilarQuestion {
	id: string;
	title?: string;
	content: string;
	tags: string[];
	answerCount: number;
	upvotes: number;
	createdAt: string;
}

export interface SimilarQuestionsResponse {
	similarQuestions: SimilarQuestion[];
	usage: {
		tokensUsed: number;
		cost: number;
	};
}

class AIService {
	// Generate questions (non-streaming)
	async generateQuestions(
		groupId: string,
		topic: string,
		context?: string,
		count: number = 3
	): Promise<GenerationResponse> {
		try {
			const response = await fetch("/api/ai/generate-question", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					groupId,
					topic,
					context,
					count,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to generate questions");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			throw error instanceof Error ? error : new Error("Unknown error");
		}
	}

	// Generate answer (non-streaming)
	async generateAnswer(
		questionId: string,
		additionalContext?: string
	): Promise<GenerationResponse> {
		try {
			const response = await fetch("/api/ai/generate-answer", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					questionId,
					additionalContext,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to generate answer");
			}

			const result = await response.json();
			return result;
		} catch (error) {
			throw error instanceof Error ? error : new Error("Unknown error");
		}
	}

	// Find similar questions (non-streaming)
	async findSimilarQuestions(
		groupId: string,
		questionText: string,
		limit: number = 5
	): Promise<SimilarQuestionsResponse> {
		const response = await fetch("/api/ai/similar-questions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				groupId,
				questionText,
				limit,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to find similar questions");
		}

		return response.json();
	}
}

export const aiService = new AIService();
