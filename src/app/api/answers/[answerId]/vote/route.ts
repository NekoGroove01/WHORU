import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { VoteSchema, MongoIdSchema } from "@/utils/schemas";
import { Answer } from "@/types/answer";

export async function POST(
	request: Request,
	{ params }: { params: { answerId: string } }
) {
	try {
		const answerIdValidation = MongoIdSchema.safeParse(params.answerId);
		if (!answerIdValidation.success) {
			return NextResponse.json(
				{ message: "Invalid answer ID format" },
				{ status: 400 }
			);
		}
		const answerObjectId = new ObjectId(answerIdValidation.data);

		const body = await request.json();
		const validation = VoteSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid input", errors: validation.error.errors },
				{ status: 400 }
			);
		}

		const { db } = await connectToDatabase();

		// For simplicity, just incrementing. No check for duplicate votes from same user yet.
		// This would typically involve tracking user sessions or IPs.
		const result = await db
			.collection("answers")
			.findOneAndUpdate(
				{ _id: answerObjectId },
				{ $inc: { upvotes: 1 }, $set: { updatedAt: new Date() } },
				{ returnDocument: "after" }
			);

		if (!result) {
			return NextResponse.json(
				{ message: "Answer not found" },
				{ status: 404 }
			);
		}

		const votedAnswer: Answer = {
			id: result._id.toHexString(),
			questionId: result.questionId.toHexString(),
			groupId: result.groupId.toHexString(),
			content: result.content,
			authorNickname: result.authorNickname,
			upvotes: result.upvotes,
			isAccepted: result.isAccepted,
			createdAt: result.createdAt.toISOString(),
			updatedAt: result.updatedAt.toISOString(),
		};

		// TODO: Emit Socket.io event: answerUpdated (groupId, questionId, votedAnswer) or a specific answerVoted event

		return NextResponse.json(votedAnswer);
	} catch (error) {
		console.error("Failed to vote on answer:", error);
		if (error instanceof Error && error.message.includes("ObjectId")) {
			return NextResponse.json(
				{ message: "Invalid answer ID format" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
