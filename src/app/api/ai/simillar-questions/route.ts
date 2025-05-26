import { NextResponse } from "next/server";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { findSimilarQuestions } from "@/utils/geminiService";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import z from "zod";

const SimilarQuestionsSchema = z.object({
	groupId: z.string(),
	questionText: z.string().max(500),
	limit: z.number().int().min(1).max(10).default(5),
});

// POST /api/ai/similar-questions - Find similar questions (non-streaming)
export const POST = withErrorHandler(
	validateRequest(SimilarQuestionsSchema)(async (req) => {
		const data = req.validatedData!;

		// Get questions from group
		const { questions } = await QuestionsCollection.findByGroup(data.groupId, {
			limit: 100,
		});

		if (questions.length === 0) {
			return NextResponse.json({ similarQuestions: [] });
		}

		// Find similar questions
		const {
			questions: similarQuestions,
			tokensUsed,
			cost,
		} = await findSimilarQuestions(data.questionText, questions, data.limit);

		// Transform to public format
		const publicQuestions = similarQuestions.map((q) => ({
			id: q._id,
			title: q.title,
			content: q.content,
			tags: q.tags,
			answerCount: q.answerCount,
			upvotes: q.upvotes,
			createdAt: q.createdAt,
		}));

		return NextResponse.json({
			similarQuestions: publicQuestions,
			usage: { tokensUsed, cost },
		});
	})
);
