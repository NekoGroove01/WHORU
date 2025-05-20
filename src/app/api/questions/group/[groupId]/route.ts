// src/app/api/questions/group/[groupId]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId, type Filter } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { MongoIdSchema, QuestionPaginationQuerySchema } from "@/utils/schemas";
import type { Question as FrontendQuestion } from "@/types/question";
import type { DbQuestion } from "@/types/schemas/question";
import type { DbGroup } from "@/types/schemas/group";

function mapDbQuestionToFrontend(dbQuestion: DbQuestion): FrontendQuestion {
	return {
		id: dbQuestion._id.toHexString(),
		groupId: dbQuestion.groupId.toHexString(),
		title: dbQuestion.title ?? null,
		content: dbQuestion.content, // Potentially truncate for list view if needed
		authorNickname: dbQuestion.authorNickname,
		tags: dbQuestion.tags ?? [],
		answerCount: dbQuestion.answerCount,
		isAnswered: dbQuestion.isAnswered,
		isResolvedByAsker: dbQuestion.isResolvedByAsker ?? false,
		upvotes: dbQuestion.upvotes,
		views: dbQuestion.views,
		createdAt: dbQuestion.createdAt.toISOString(),
		updatedAt: dbQuestion.updatedAt.toISOString(),
	};
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { groupId: string } }
) {
	try {
		const groupIdValidation = MongoIdSchema.safeParse(params.groupId);
		if (!groupIdValidation.success) {
			return NextResponse.json(
				{ message: "Invalid group ID format" },
				{ status: 400 }
			);
		}
		const validGroupId = new ObjectId(groupIdValidation.data);

		const { searchParams } = request.nextUrl;
		const queryParams = Object.fromEntries(searchParams.entries());
		const validationResult =
			QuestionPaginationQuerySchema.safeParse(queryParams);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid query parameters",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const {
			page,
			limit,
			sortBy: rawSortBy,
			sortOrder,
			tags: tagsQuery,
			filter: filterQuery,
		} = validationResult.data;

		const { db } = await connectToDatabase();

		// Verify group exists
		const group = await db
			.collection<DbGroup>("groups")
			.findOne({ _id: validGroupId }, { projection: { _id: 1 } });
		if (!group) {
			return NextResponse.json({ message: "Group not found" }, { status: 404 });
		}

		const skip = (page - 1) * limit;
		const queryFilter: Filter<DbQuestion> = { groupId: validGroupId };

		if (tagsQuery) {
			const tagsArray = tagsQuery
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean);
			if (tagsArray.length > 0) {
				queryFilter.tags = { $in: tagsArray };
			}
		}

		switch (filterQuery) {
			case "unanswered":
				queryFilter.isAnswered = false;
				break;
			case "answered":
				queryFilter.isAnswered = true;
				break;
			// 'mine' requires author identification beyond nickname, so skipped for now
			// case "mine":
			// queryFilter.authorNickname = currentUserNickname; // Placeholder
			// break;
			default: // "all" or "recent"
				break;
		}

		let sortBy = rawSortBy;
		if (filterQuery === "popular" && !sortBy) {
			sortBy = "upvotes"; // Default sort for popular
		} else if (!sortBy) {
			sortBy = "createdAt"; // Default sort
		}

		const sortOptions: { [key: string]: 1 | -1 } = {};
		if (sortBy) {
			sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
		} else {
			sortOptions["createdAt"] = -1; // Default sort
		}

		const questionsCollection = db.collection<DbQuestion>("questions");
		const totalQuestions = await questionsCollection.countDocuments(
			queryFilter
		);
		const dbQuestions = await questionsCollection
			.find(queryFilter)
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.toArray();

		const questions = dbQuestions.map(mapDbQuestionToFrontend);

		return NextResponse.json(
			{
				questions,
				totalPages: Math.ceil(totalQuestions / limit),
				currentPage: page,
				totalQuestions,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to fetch questions for group:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
