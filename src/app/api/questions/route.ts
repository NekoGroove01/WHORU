import { NextResponse } from "next/server";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { CreateQuestionSchema } from "@/types/schemas/question";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import { broadcastQuestionCreated } from "@/lib/socket/handlers";

// POST /api/questions - Create new question
export const POST = withErrorHandler(
	validateRequest(CreateQuestionSchema)(async (req) => {
		const data = req.validatedData!;

		const question = await QuestionsCollection.create(data);

		// Broadcast to group via Socket.IO
		broadcastQuestionCreated(data.groupId, question);

		return NextResponse.json({
			id: question._id,
			groupId: question.groupId,
			title: question.title,
			content: question.content,
			authorNickname: question.authorNickname,
			tags: question.tags,
			answerCount: question.answerCount,
			isAnswered: question.isAnswered,
			upvotes: question.upvotes,
			views: question.views,
			createdAt: question.createdAt,
		});
	})
);
