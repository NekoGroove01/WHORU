import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { PaginationQuerySchema, MongoIdSchema } from "@/utils/schemas";
import { Answer } from "@/types/answer";

export async function GET(
	request: Request,
	{ params }: { params: { questionId: string } }
) {
	try {
		const questionIdValidation = MongoIdSchema.safeParse(params.questionId);
		if (!questionIdValidation.success) {
			return NextResponse.json(
				{ message: "Invalid question ID format" },
				{ status: 400 }
			);
		}
		const questionObjectId = new ObjectId(questionIdValidation.data);

		const { searchParams } = new URL(request.url);
		const queryParams = Object.fromEntries(searchParams.entries());
		const paginationValidation = PaginationQuerySchema.safeParse(queryParams);

		if (!paginationValidation.success) {
			return NextResponse.json(
				{
					message: "Invalid pagination parameters",
					errors: paginationValidation.error.errors,
				},
				{ status: 400 }
			);
		}
		const { page, limit, sortBy, sortOrder } = paginationValidation.data;
		const skip = (page - 1) * limit;

		const sortOptions: { [key: string]: 1 | -1 } = {};
		if (sortBy) {
			sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
		} else {
			sortOptions["createdAt"] = -1; // Default sort
		}

		const { db } = await connectToDatabase();

		const answersCursor = db
			.collection("answers")
			.find({ questionId: questionObjectId })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit);

		const answersArray = await answersCursor.toArray();
		const totalAnswers = await db
			.collection("answers")
			.countDocuments({ questionId: questionObjectId });

		const formattedAnswers: Answer[] = answersArray.map((ans) => ({
			id: ans._id.toHexString(),
			questionId: ans.questionId.toHexString(),
			groupId: ans.groupId.toHexString(),
			content: ans.content,
			authorNickname: ans.authorNickname,
			upvotes: ans.upvotes,
			isAccepted: ans.isAccepted,
			createdAt: ans.createdAt.toISOString(),
			updatedAt: ans.updatedAt.toISOString(),
		}));

		return NextResponse.json({
			answers: formattedAnswers,
			totalPages: Math.ceil(totalAnswers / limit),
			currentPage: page,
			totalAnswers: totalAnswers,
		});
	} catch (error) {
		console.error("Failed to fetch answers:", error);
		if (error instanceof Error && error.message.includes("ObjectId")) {
			return NextResponse.json(
				{ message: "Invalid question ID format" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
