import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { withErrorHandler } from "@/middleware/errorHandler";

type RouteParams = {
	params: { questionId: string };
};

// GET /api/answers/question/[questionId] - Get answers by question
export const GET = withErrorHandler<RouteParams>(async (req, context) => {
	// Validate questionId parameter
	if (!context?.params?.questionId) {
		return NextResponse.json(
			{ error: "Question ID is required" },
			{ status: 400 }
		);
	}
	const { params } = context;
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "50");
	const sortBy = searchParams.get("sortBy") as
		| "newest"
		| "oldest"
		| "votes"
		| undefined;

	const skip = (page - 1) * limit;

	const { answers, total } = await AnswersCollection.findByQuestion(
		params.questionId,
		{
			skip,
			limit,
			sortBy,
		}
	);

	const publicAnswers = answers.map((a) => ({
		id: a._id,
		questionId: a.questionId,
		groupId: a.groupId,
		content: a.content,
		authorNickname: a.authorNickname,
		upvotes: a.upvotes,
		isAccepted: a.isAccepted,
		createdAt: a.createdAt,
	}));

	return NextResponse.json({
		answers: publicAnswers,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
});
