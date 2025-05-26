import { NextResponse } from "next/server";
import { AIUsageLogsCollection } from "@/lib/db/collections/aiUsageLogs";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { generateAnswerStream } from "@/utils/geminiService";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, NotFoundError } from "@/middleware/errorHandler";
import z from "zod";

const GenerateAnswerSchema = z.object({
	questionId: z.string(),
	additionalContext: z.string().max(1000).optional(),
});

// POST /api/ai/generate-answer - Generate answer with streaming
export const POST = withErrorHandler(
	validateRequest(GenerateAnswerSchema)(async (req) => {
		const data = req.validatedData!;

		// Get question
		const question = await QuestionsCollection.findById(data.questionId);
		if (!question) {
			throw new NotFoundError("Question not found");
		}

		const userIdentifier = req.headers.get("x-forwarded-for") || "anonymous";

		// Check usage limits
		const usageCount = await AIUsageLogsCollection.getUsageCount(
			userIdentifier,
			"generate_answer",
			data.questionId
		);

		if (usageCount >= 3) {
			return NextResponse.json(
				{ error: "Usage limit exceeded for this question" },
				{ status: 429 }
			);
		}

		// Create streaming response
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				let fullResponse = "";
				let tokensUsed = 0;
				let cost = 0;

				await generateAnswerStream(
					question.content,
					question.title || "",
					data.additionalContext,
					{
						onChunk: (text) => {
							fullResponse += text;
							controller.enqueue(encoder.encode(text));
						},
						onError: (error) => {
							controller.enqueue(encoder.encode(`\n\nError: ${error.message}`));
							controller.close();
						},
						onComplete: async (tokens, totalCost) => {
							tokensUsed = tokens;
							cost = totalCost;

							// Log usage
							await AIUsageLogsCollection.create({
								groupId: question.groupId,
								questionId: data.questionId,
								usageType: "generate_answer",
								userIdentifier,
								prompt: question.content,
								response: fullResponse,
								tokensUsed,
								cost,
							});

							controller.close();
						},
					}
				);
			},
		});

		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"X-Content-Type-Options": "nosniff",
			},
		});
	})
);
