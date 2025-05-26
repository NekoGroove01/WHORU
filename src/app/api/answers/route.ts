import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { CreateAnswerSchema } from "@/types/schemas/answer";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import { broadcastAnswerCreated } from "@/lib/socket/handlers";

// POST /api/answers - Create new answer
export const POST = withErrorHandler(
	validateRequest(CreateAnswerSchema)(async (req) => {
		const data = req.validatedData!;

		const answer = await AnswersCollection.create(data);

		// Broadcast to group via Socket.IO
		broadcastAnswerCreated(answer.groupId, data.questionId, answer);

		return NextResponse.json({
			id: answer._id,
			questionId: answer.questionId,
			groupId: answer.groupId,
			content: answer.content,
			authorNickname: answer.authorNickname,
			upvotes: answer.upvotes,
			isAccepted: answer.isAccepted,
			createdAt: answer.createdAt,
		});
	})
);
