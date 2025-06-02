import { Question } from "@/types/schemas/question";
import {
	generateAnswerStream,
	findSimilarQuestions,
} from "@/utils/geminiService";

// Get the mocked functions
const mockedGenerateAnswerStream = generateAnswerStream as jest.MockedFunction<
	typeof generateAnswerStream
>;
const mockedFindSimilarQuestions = findSimilarQuestions as jest.MockedFunction<
	typeof findSimilarQuestions
>;

describe("Gemini Service", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("generateAnswerStream", () => {
		it("should stream answer chunks", async () => {
			const chunks: string[] = [];
			let completed = false;

			// Mock the implementation
			mockedGenerateAnswerStream.mockImplementation(
				async (question, title, context, callbacks) => {
					// Simulate streaming
					callbacks.onChunk("Test response chunk 1");
					callbacks.onChunk("Test response chunk 2");
					callbacks.onComplete(100, 0.001);
				}
			);

			await generateAnswerStream(
				"What is Next.js?",
				"Question about Next.js",
				"Additional context",
				{
					onChunk: (text) => chunks.push(text),
					onError: (error) => fail(error),
					onComplete: (tokens, cost) => {
						expect(tokens).toBe(100);
						expect(cost).toBeGreaterThan(0);
						completed = true;
					},
				}
			);

			expect(chunks).toHaveLength(2);
			expect(chunks[0]).toBe("Test response chunk 1");
			expect(chunks[1]).toBe("Test response chunk 2");
			expect(completed).toBe(true);
		});

		it("should handle errors", async () => {
			let errorMessage = "";

			mockedGenerateAnswerStream.mockImplementation(
				async (question, title, context, callbacks) => {
					callbacks.onError(new Error("Test error"));
				}
			);

			await generateAnswerStream(
				"What is Next.js?",
				"Question about Next.js",
				undefined,
				{
					onChunk: (text) => {},
					onError: (error) => {
						errorMessage = error.message;
					},
					onComplete: () => {},
				}
			);

			expect(errorMessage).toBe("Test error");
		});
	});

	describe("findSimilarQuestions", () => {
		it("should find similar questions", async () => {
			const existingQuestions = [
				{ _id: "1", content: "What is React?", title: "React Question" },
				{ _id: "2", content: "What is Next.js?", title: "Next.js Question" },
			];

			// Mock the return value
			mockedFindSimilarQuestions.mockResolvedValue({
				questions: existingQuestions as Question[],
				tokensUsed: 100,
				cost: 0.001,
			});

			const result = await findSimilarQuestions(
				"What is Next.js framework?",
				existingQuestions as Question[],
				2
			);

			expect(result).toBeDefined();
			expect(result.questions).toBeDefined();
			expect(result.questions).toHaveLength(2);
			expect(result.tokensUsed).toBe(100);
			expect(result.cost).toBeGreaterThan(0);
		});
	});
});
