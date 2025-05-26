import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { UpdateAnswerSchema } from "@/types/schemas/answer";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, NotFoundError } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { answerId: string };
};

// GET /api/answers/[answerId] - Get specific answer
export const GET = withErrorHandler<RouteParams>(async (req, context) => {
	// Validate answerId parameter
	if (!context?.params?.answerId) {
		return NextResponse.json(
			{ error: "Answer ID is required" },
			{ status: 400 }
		);
	}
	const { params } = context;
	const answer = await AnswersCollection.findById(params.answerId);

	if (!answer) {
		throw new NotFoundError("Answer not found");
	}

	return NextResponse.json({
		id: answer._id,
		questionId: answer.questionId,
		groupId: answer.groupId,
		content: answer.content,
		authorNickname: answer.authorNickname,
		upvotes: answer.upvotes,
		isAccepted: answer.isAccepted,
		createdAt: answer.createdAt,
		updatedAt: answer.updatedAt,
	});
});

// PUT /api/answers/[answerId] - Update answer
export const PUT = withErrorHandler<RouteParams>(
	validateRequest(UpdateAnswerSchema)(async (req, context) => {
		// Validate answerId parameter
		if (!context?.params?.answerId) {
			return NextResponse.json(
				{ error: "Answer ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { content, authorPassword } = req.validatedData!;

		const answer = await AnswersCollection.update(
			params.answerId,
			content,
			authorPassword
		);

		if (!answer) {
			throw new NotFoundError("Answer not found");
		}

		return NextResponse.json({
			id: answer._id,
			content: answer.content,
			updatedAt: answer.updatedAt,
		});
	})
);

// DELETE /api/answers/[answerId] - Delete answer
const DeleteSchema = z.object({
	authorPassword: z.string().min(6),
});

export const DELETE = withErrorHandler<RouteParams>(
	validateRequest(DeleteSchema)(async (req, context) => {
		// Validate answerId parameter
		if (!context?.params?.answerId) {
			return NextResponse.json(
				{ error: "Answer ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { authorPassword } = req.validatedData!;

		const deleted = await AnswersCollection.delete(
			params.answerId,
			authorPassword
		);

		if (!deleted) {
			throw new NotFoundError("Answer not found");
		}

		return NextResponse.json({ success: true });
	})
);
