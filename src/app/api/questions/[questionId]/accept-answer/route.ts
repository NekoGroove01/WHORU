import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { withValidation } from "@/middleware/withMiddleware";
import z from "zod";

const AcceptAnswerSchema = z.object({
	answerId: z.string(),
	questionAuthorPassword: z.string().min(6),
});

// POST /api/questions/[questionId]/accept-answer - Accept an answer
export const POST = withValidation(AcceptAnswerSchema)(async (req, context) => {
	const params = await context?.params;
	// Validate questionId parameter
	if (!params?.questionId) {
		return NextResponse.json(
			{ error: "Question ID is required" },
			{ status: 400 }
		);
	}
	const { answerId, questionAuthorPassword } = req.validatedData!;

	// Get question info for Socket.IO broadcasting
	const { QuestionsCollection } = await import(
		"@/lib/db/collections/questions"
	);
	const question = await QuestionsCollection.findById(params.questionId);
	if (!question) {
		return NextResponse.json({ error: "Question not found" }, { status: 404 });
	}

	const accepted = await AnswersCollection.acceptAnswer(
		answerId,
		params.questionId,
		questionAuthorPassword
	);

	if (!accepted) {
		return NextResponse.json(
			{ error: "Failed to accept answer" },
			{ status: 400 }
		);
	}

	// Broadcast accept via Socket.IO
	const { broadcastAnswerAccepted } = await import("@/lib/socket/handlers");
	broadcastAnswerAccepted(question.groupId, params.questionId, answerId);

	return NextResponse.json({ success: true });
});
