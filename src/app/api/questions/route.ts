// src/app/api/questions/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import { CreateQuestionSchema } from "@/utils/schemas";
import type { Question as FrontendQuestion } from "@/types/question";
import type { DbQuestion } from "@/types/schemas/question"; // Using your specified path
import type { DbGroup } from "@/types/schemas/group"; // Using your specified path

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);

function mapDbQuestionToFrontend(dbQuestion: DbQuestion): FrontendQuestion {
	return {
		id: dbQuestion._id.toHexString(),
		groupId: dbQuestion.groupId.toHexString(),
		title: dbQuestion.title ?? null,
		content: dbQuestion.content,
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

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validationResult = CreateQuestionSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const {
			groupId,
			title,
			content,
			authorNickname,
			tags,
			managementPassword,
		} = validationResult.data;

		const { db } = await connectToDatabase();

		// Verify group exists
		const groupObjectId = new ObjectId(groupId);
		const group = await db
			.collection<DbGroup>("groups")
			.findOne({ _id: groupObjectId });
		if (!group) {
			return NextResponse.json({ message: "Group not found" }, { status: 404 });
		}

		let managementPasswordHash: string | undefined;
		if (managementPassword) {
			managementPasswordHash = await bcrypt.hash(
				managementPassword,
				BCRYPT_SALT_ROUNDS
			);
		}

		const now = new Date();
		const newQuestionDocument: Omit<DbQuestion, "_id"> = {
			groupId: groupObjectId,
			title: title ?? undefined,
			content,
			authorNickname,
			tags: tags ?? [],
			managementPasswordHash, // Store if provided
			answerCount: 0,
			isAnswered: false,
			isResolvedByAsker: false,
			upvotes: 0,
			views: 0,
			createdAt: now,
			updatedAt: now,
		};

		const questionsCollection =
			db.collection<Omit<DbQuestion, "_id">>("questions");
		const result = await questionsCollection.insertOne(newQuestionDocument);

		if (!result.insertedId) {
			return NextResponse.json(
				{ message: "Failed to create question" },
				{ status: 500 }
			);
		}

		const createdQuestion = {
			_id: result.insertedId,
			...newQuestionDocument,
		} as DbQuestion;

		// Update group's questionCount and lastActivityAt
		await db
			.collection<DbGroup>("groups")
			.updateOne(
				{ _id: groupObjectId },
				{ $inc: { questionCount: 1 }, $set: { lastActivityAt: now } }
			);

		// TODO: Emit Socket.io event: newQuestion (groupId, questionData)

		return NextResponse.json(
			{ question: mapDbQuestionToFrontend(createdQuestion) },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Failed to create question:", error);
		// Check for duplicate key errors if any unique indexes are added later
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
