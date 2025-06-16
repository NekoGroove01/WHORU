import { NextResponse } from "next/server";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { NotFoundError, withErrorHandler } from "@/middleware/withMiddleware";

type RouteParams = {
	questionId: string;
};

// POST /api/questions/[questionId]/upvote - Upvote a question
export const POST = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;
	// Validate questionId parameter
	if (!params?.questionId) {
		return NextResponse.json(
			{ error: "Question ID is required" },
			{ status: 400 }
		);
	}

	// Check if question exists before upvoting
	const question = await QuestionsCollection.findById(params.questionId);
	if (!question) {
		throw new NotFoundError("Question not found");
	}

	// Increment upvote count
	await QuestionsCollection.upvote(params.questionId);

	// Return updated upvote count
	const updatedQuestion = await QuestionsCollection.findById(params.questionId);

	return NextResponse.json({
		success: true,
		upvotes: updatedQuestion?.upvotes || question.upvotes + 1,
	});
});
