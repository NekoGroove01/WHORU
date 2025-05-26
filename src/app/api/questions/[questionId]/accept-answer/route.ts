import { NextResponse } from "next/server";
import { AnswersCollection } from "@/lib/db/collections/answers";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { questionId: string };
};

const AcceptAnswerSchema = z.object({
	answerId: z.string(),
	questionAuthorPassword: z.string().min(6),
});

// POST /api/questions/[questionId]/accept-answer - Accept an answer
export const POST = withErrorHandler<RouteParams>(
	validateRequest(AcceptAnswerSchema)(async (req, context) => {
		// Validate questionId parameter
		if (!context?.params?.questionId) {
			return NextResponse.json(
				{ error: "Question ID is required" },
				{ status: 400 }
			);
		}
		const { params } = context;
		const { answerId, questionAuthorPassword } = req.validatedData!;

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

		return NextResponse.json({ success: true });
	})
);
