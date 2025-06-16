import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { VoteAnswerSchema } from "@/types/schemas/answer";
import { withValidation } from "@/middleware/withMiddleware";
import { broadcastAnswerVoted } from "@/lib/socket/handlers";

// Define params type
type AnswerParams = {
	answerId: string;
};

// POST /api/answers/[answerId]/vote - Vote on answer
export const POST = withValidation<typeof VoteAnswerSchema, AnswerParams>(
	VoteAnswerSchema
)(async (req, context) => {
	const params = await context?.params;
	// Validate answerId parameter
	if (!params?.answerId) {
		return NextResponse.json(
			{ error: "Answer ID is required" },
			{ status: 400 }
		);
	}
	const { voteType } = req.validatedData!;

	if (voteType === "upvote") {
		const updatedAnswer = await AnswersCollection.upvote(params.answerId);

		if (updatedAnswer) {
			// Broadcast vote update via Socket.IO
			broadcastAnswerVoted(
				updatedAnswer.groupId,
				updatedAnswer.questionId,
				params.answerId,
				updatedAnswer.upvotes
			);
		}
	}

	return NextResponse.json({ success: true });
});
