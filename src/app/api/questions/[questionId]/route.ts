import { NextResponse } from "next/server";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { UpdateQuestionSchema } from "@/types/schemas/question";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, NotFoundError } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { questionId: string };
};

// GET /api/questions/[questionId] - Get specific question
export const GET = withErrorHandler<RouteParams>(async (req, context) => {
	// Validate questionId parameter
	if (!context?.params?.questionId) {
		return NextResponse.json(
			{ error: "Question ID is required" },
			{ status: 400 }
		);
	}

	const { params } = context;
	const question = await QuestionsCollection.findById(params.questionId);

	if (!question) {
		throw new NotFoundError("Question not found");
	}

	return NextResponse.json({
		id: question._id,
		groupId: question.groupId,
		title: question.title,
		content: question.content,
		authorNickname: question.authorNickname,
		tags: question.tags,
		answerCount: question.answerCount,
		isAnswered: question.isAnswered,
		isResolvedByAsker: question.isResolvedByAsker,
		upvotes: question.upvotes,
		views: question.views,
		createdAt: question.createdAt,
		updatedAt: question.updatedAt,
	});
});

// PUT /api/questions/[questionId] - Update question
export const PUT = withErrorHandler<RouteParams>(
	validateRequest(UpdateQuestionSchema)(async (req, context) => {
		// Validate questionId parameter
		if (!context?.params?.questionId) {
			return NextResponse.json(
				{ error: "Question ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { authorPassword, ...updateData } = req.validatedData!;

		const question = await QuestionsCollection.update(
			params.questionId,
			updateData,
			authorPassword
		);

		if (!question) {
			throw new NotFoundError("Question not found");
		}

		return NextResponse.json({
			id: question._id,
			title: question.title,
			content: question.content,
			tags: question.tags,
			updatedAt: question.updatedAt,
		});
	})
);

// DELETE /api/questions/[questionId] - Delete question
const DeleteSchema = z.object({
	authorPassword: z.string().min(6),
});

export const DELETE = withErrorHandler<RouteParams>(
	validateRequest(DeleteSchema)(async (req, context) => {
		// Validate questionId parameter
		if (!context?.params?.questionId) {
			return NextResponse.json(
				{ error: "Question ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { authorPassword } = req.validatedData!;

		const deleted = await QuestionsCollection.delete(
			params.questionId,
			authorPassword
		);

		if (!deleted) {
			throw new NotFoundError("Question not found");
		}

		return NextResponse.json({ success: true });
	})
);
