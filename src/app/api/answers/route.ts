import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { CreateAnswerSchema } from "@/utils/schemas";
import type { Answer } from "@/types/answer"; // For response type
import type { Question } from "@/types/question"; // For updating question
// Assuming a Group type exists if we update group.lastActivityAt
// import type { Group } from "@/types/group";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = CreateAnswerSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					message: "Invalid input.",
					errors: validation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { questionId, content, authorNickname } = validation.data;

		if (!ObjectId.isValid(questionId)) {
			return NextResponse.json(
				{ message: "Invalid question ID format." },
				{ status: 400 }
			);
		}

		const { db } = await connectToDatabase();

		const questionObjectId = new ObjectId(questionId);
		const question = await db
			.collection<Question>("questions")
			.findOne({ _id: questionObjectId });

		if (!question) {
			return NextResponse.json(
				{ message: "Question not found." },
				{ status: 404 }
			);
		}

		const now = new Date();
		const newAnswer = {
			_id: new ObjectId(),
			questionId: questionObjectId,
			groupId: question.groupId, // Denormalize groupId from question
			content,
			authorNickname,
			upvotes: 0,
			isAccepted: false,
			createdAt: now,
			updatedAt: now,
		};

		const insertResult = await db.collection("answers").insertOne(newAnswer);
		if (!insertResult.insertedId) {
			return NextResponse.json(
				{ message: "Failed to create answer." },
				{ status: 500 }
			);
		}

		// Update question's answerCount and group's lastActivityAt
		await db.collection<Question>("questions").updateOne(
			{ _id: questionObjectId },
			{
				$inc: { answerCount: 1 },
				$set: { updatedAt: now.toDateString() }, // Also update question's updatedAt
			}
		);

		if (question.groupId) {
			await db.collection("groups").updateOne(
				{ _id: new ObjectId(question.groupId) }, // Assuming groupId in Question is ObjectId or string convertible to ObjectId
				{ $set: { lastActivityAt: now } }
			);
		}

		// TODO: Emit Socket.io event: newAnswer(groupId, questionId, newAnswer)

		const createdAnswer: Answer = {
			...newAnswer,
			id: newAnswer._id.toHexString(),
			questionId: newAnswer.questionId.toHexString(),
			groupId: newAnswer.groupId.toString(),
			createdAt: newAnswer.createdAt.toISOString(),
			updatedAt: newAnswer.updatedAt.toISOString(),
		};

		return NextResponse.json(createdAnswer, { status: 201 });
	} catch (error) {
		console.error("Error creating answer:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
