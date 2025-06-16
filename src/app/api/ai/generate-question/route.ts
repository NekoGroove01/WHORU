import { NextResponse } from "next/server";
import { AIUsageLogsCollection } from "@/lib/db/collections/aiUsageLogs";
import { generateQuestions } from "@/utils/geminiService";
import { withValidation } from "@/middleware/withMiddleware";
import z from "zod";

const GenerateQuestionSchema = z.object({
	groupId: z.string(),
	topic: z.string().max(200),
	context: z.string().max(1000).optional(),
	count: z.number().int().min(1).max(5).default(3),
});

// POST /api/ai/generate-question - Generate questions (non-streaming)
export const POST = withValidation(GenerateQuestionSchema)(async (req) => {
	const data = req.validatedData!;
	const userIdentifier = req.headers.get("x-forwarded-for") || "anonymous";

	// Check usage limits
	const usageCount = await AIUsageLogsCollection.getUsageCount(
		userIdentifier,
		"generate_question",
		undefined,
		new Date(Date.now() - 24 * 60 * 60 * 1000)
	);

	if (usageCount >= 1000) {
		return NextResponse.json(
			{ error: "Daily usage limit exceeded" },
			{ status: 429 }
		);
	}

	try {
		// Generate questions
		const { text, tokensUsed, cost } = await generateQuestions(
			data.topic,
			data.context,
			data.count
		);

		// Log usage
		try {
			await AIUsageLogsCollection.create({
				groupId: data.groupId,
				usageType: "generate_question",
				userIdentifier,
				prompt: `Topic: ${data.topic}, Context: ${data.context || "None"}`,
				response: text,
				tokensUsed,
				cost,
			});
		} catch (error) {
			console.error("Failed to log usage:", error);
		}

		return NextResponse.json({
			text,
			usage: {
				tokensUsed,
				cost,
			},
		});
	} catch (error) {
		console.error("Error generating questions:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "An unexpected error occurred while generating questions",
			},
			{ status: 500 }
		);
	}
});
