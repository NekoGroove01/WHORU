import { NextResponse } from "next/server";
import { AIUsageLogsCollection } from "@/lib/db/collections/aiUsageLogs";
import { generateQuestionsStream } from "@/utils/geminiService";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import z from "zod";

const GenerateQuestionSchema = z.object({
	groupId: z.string(),
	topic: z.string().max(200),
	context: z.string().max(1000).optional(),
	count: z.number().int().min(1).max(5).default(3),
});

// POST /api/ai/generate-question - Generate questions with streaming
export const POST = withErrorHandler(
	validateRequest(GenerateQuestionSchema)(async (req) => {
		const data = req.validatedData!;
		const userIdentifier = req.headers.get("x-forwarded-for") || "anonymous";

		// Check usage limits
		const usageCount = await AIUsageLogsCollection.getUsageCount(
			userIdentifier,
			"generate_question",
			undefined,
			new Date(Date.now() - 24 * 60 * 60 * 1000)
		);

		if (usageCount >= 10) {
			return NextResponse.json(
				{ error: "Daily usage limit exceeded" },
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

				await generateQuestionsStream(data.topic, data.context, data.count, {
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

						// Log usage after completion
						await AIUsageLogsCollection.create({
							groupId: data.groupId,
							usageType: "generate_question",
							userIdentifier,
							prompt: `Topic: ${data.topic}, Context: ${
								data.context || "None"
							}`,
							response: fullResponse,
							tokensUsed,
							cost,
						});

						controller.close();
					},
				});
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
