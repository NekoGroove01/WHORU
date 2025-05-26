import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { VoteAnswerSchema } from "@/types/schemas/answer";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";

type RouteParams = {
	params: { answerId: string };
};

// POST /api/answers/[answerId]/vote - Vote on answer
export const POST = withErrorHandler<RouteParams>(
	validateRequest(VoteAnswerSchema)(async (req, context) => {
		// Validate answerId parameter
		if (!context?.params?.answerId) {
			return NextResponse.json(
				{ error: "Answer ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { voteType } = req.validatedData!;

		if (voteType === "upvote") {
			await AnswersCollection.upvote(params.answerId);
		}

		return NextResponse.json({ success: true });
	})
);
