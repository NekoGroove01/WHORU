import { NextResponse } from "next/server";
import { AIUsageLogsCollection } from "@/lib/db/collections/aiUsageLogs";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { generateAnswer } from "@/utils/geminiService";
import z from "zod";
import { withValidation, NotFoundError } from "@/middleware/withMiddleware";

const GenerateAnswerSchema = z.object({
	questionId: z.string(),
	additionalContext: z.string().max(1000).optional(),
});

// POST /api/ai/generate-answer - Generate answer (non-streaming)
export const POST = withValidation(GenerateAnswerSchema)(async (req) => {
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

	if (usageCount >= 300000) {
		return NextResponse.json(
			{ error: "Usage limit exceeded for this question" },
			{ status: 429 }
		);
	}

	// Generate answer directly without retry logic
	const { text, tokensUsed, cost } = await generateAnswer(
		question.content,
		question.title || "",
		data.additionalContext
	);

	// Log usage
	try {
		await AIUsageLogsCollection.create({
			groupId: question.groupId,
			questionId: data.questionId,
			usageType: "generate_answer",
			userIdentifier,
			prompt: question.content,
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
});
