import { NextResponse } from "next/server";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { withErrorHandler } from "@/middleware/withMiddleware";

type RouteParams = {
	groupId: string;
};

// GET /api/questions/group/[groupId] - Get questions by group
export const GET = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;
	// Validate groupId parameter
	if (!params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "20");
	const sortBy = searchParams.get("sortBy") as
		| "recent"
		| "popular"
		| "unanswered"
		| undefined;
	const tags = searchParams.get("tags")?.split(",").filter(Boolean);

	const skip = (page - 1) * limit;

	const { questions, total } = await QuestionsCollection.findByGroup(
		params.groupId,
		{
			skip,
			limit,
			sortBy,
			tags,
		}
	);

	const publicQuestions = questions.map((q) => ({
		id: q._id,
		groupId: q.groupId,
		title: q.title,
		content: q.content,
		authorNickname: q.authorNickname,
		tags: q.tags,
		answerCount: q.answerCount,
		isAnswered: q.isAnswered,
		upvotes: q.upvotes,
		views: q.views,
		createdAt: q.createdAt,
	}));

	return NextResponse.json({
		questions: publicQuestions,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
});
