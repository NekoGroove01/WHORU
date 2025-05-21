import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import { CreateAnswerSchema } from "@/utils/schemas";
import { Answer } from "@/types/answer"; // Assuming this type is for frontend, backend will shape it

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10");

export async function POST(request: Request) {
	try {
		const { db } = await connectToDatabase();
		const body = await request.json();

		const validation = CreateAnswerSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid input", errors: validation.error.errors },
				{ status: 400 }
			);
		}

		const { questionId, content, authorNickname, managementPassword } =
			validation.data;

		const questionObjectId = new ObjectId(questionId);

		// Verify question exists
		const question = await db
			.collection("questions")
			.findOne({ _id: questionObjectId });
		if (!question) {
			return NextResponse.json(
				{ message: "Question not found" },
				{ status: 404 }
			);
		}

		let managementPasswordHash: string | undefined = undefined;
		if (managementPassword) {
			managementPasswordHash = await bcrypt.hash(
				managementPassword,
				BCRYPT_SALT_ROUNDS
			);
		}

		const now = new Date();
		const newAnswer = {
			questionId: questionObjectId,
			groupId: question.groupId, // Denormalize groupId for easier querying/scoping
			content,
			authorNickname,
			managementPasswordHash,
			upvotes: 0,
			isAccepted: false,
			createdAt: now,
			updatedAt: now,
		};

		const result = await db.collection("answers").insertOne(newAnswer);

		if (!result.insertedId) {
			return NextResponse.json(
				{ message: "Failed to create answer" },
				{ status: 500 }
			);
		}

		// Update question's answerCount and group's lastActivityAt
		await db
			.collection("questions")
			.updateOne(
				{ _id: questionObjectId },
				{ $inc: { answerCount: 1 }, $set: { updatedAt: now } }
			);

		if (question.groupId) {
			await db
				.collection("groups")
				.updateOne(
					{ _id: question.groupId },
					{ $set: { lastActivityAt: now } }
				);
		}

		const createdAnswer: Answer = {
			id: result.insertedId.toHexString(),
			questionId: newAnswer.questionId.toHexString(),
			groupId: newAnswer.groupId.toHexString(),
			content: newAnswer.content,
			authorNickname: newAnswer.authorNickname,
			upvotes: newAnswer.upvotes,
			isAccepted: newAnswer.isAccepted,
			createdAt: newAnswer.createdAt.toISOString(),
			updatedAt: newAnswer.updatedAt.toISOString(),
		};

		// TODO: Emit Socket.io event: newAnswer (groupId, questionId, createdAnswer)

		return NextResponse.json(createdAnswer, { status: 201 });
	} catch (error) {
		console.error("Failed to create answer:", error);
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
