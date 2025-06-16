// app/api/answers/[answerId]/route.ts
import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { UpdateAnswerSchema } from "@/types/schemas/answer";
import {
	withErrorHandler,
	withValidation,
	NotFoundError,
} from "@/middleware/withMiddleware";
import z from "zod";

// Define params type
type AnswerParams = {
	answerId: string;
};

// GET /api/answers/[answerId] - Get specific answer
export const GET = withErrorHandler<AnswerParams>()(async (req, context) => {
	// Await params as per Next.js 14+
	const { answerId } = await context!.params;

	if (!answerId) {
		return NextResponse.json(
			{ error: "Answer ID is required" },
			{ status: 400 }
		);
	}

	const answer = await AnswersCollection.findById(answerId);

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
export const PUT = withValidation<typeof UpdateAnswerSchema, AnswerParams>(
	UpdateAnswerSchema
)(async (req, context) => {
	const { answerId } = await context!.params;

	if (!answerId) {
		return NextResponse.json(
			{ error: "Answer ID is required" },
			{ status: 400 }
		);
	}

	// validatedData is automatically typed based on UpdateAnswerSchema
	const { content, authorPassword } = req.validatedData!;

	const answer = await AnswersCollection.update(
		answerId,
		content,
		authorPassword
	);

	if (!answer) {
		throw new NotFoundError("Answer not found");
	}

	// Broadcast update via Socket.IO
	const { broadcastAnswerUpdated } = await import("@/lib/socket/handlers");
	broadcastAnswerUpdated(
		answer.groupId,
		answer.questionId,
		answer._id,
		content
	);

	return NextResponse.json({
		id: answer._id,
		content: answer.content,
		updatedAt: answer.updatedAt,
	});
});

// DELETE /api/answers/[answerId] - Delete answer
const DeleteSchema = z.object({
	authorPassword: z.string().min(6),
});

export const DELETE = withValidation<typeof DeleteSchema, AnswerParams>(
	DeleteSchema
)(async (req, context) => {
	const { answerId } = await context!.params;

	if (!answerId) {
		return NextResponse.json(
			{ error: "Answer ID is required" },
			{ status: 400 }
		);
	}

	const { authorPassword } = req.validatedData!;

	// Get the answer first to get groupId and questionId for broadcasting
	const answerToDelete = await AnswersCollection.findById(answerId);
	if (!answerToDelete) {
		throw new NotFoundError("Answer not found");
	}

	const deleted = await AnswersCollection.delete(answerId, authorPassword);

	if (!deleted) {
		throw new NotFoundError("Answer not found");
	}

	// Broadcast delete via Socket.IO
	const { broadcastAnswerDeleted } = await import("@/lib/socket/handlers");
	broadcastAnswerDeleted(
		answerToDelete.groupId,
		answerToDelete.questionId,
		answerId
	);

	return NextResponse.json({ success: true });
});
