// src/app/api/questions/[questionId]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { Db, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import {
	MongoIdSchema,
	UpdateQuestionSchema,
	QuestionManagementAuthSchema,
} from "@/utils/schemas";
import type { Question as FrontendQuestion } from "@/types/question";
import type { DbQuestion } from "@/types/schemas/question";
import type { DbGroup } from "@/types/schemas/group";
import type { DbAnswer } from "@/types/schemas/answer";

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

// Helper function to verify question management password or group admin
async function verifyQuestionOwnership(
	db: Db,
	question: DbQuestion,
	managementPassword?: string
): Promise<boolean> {
	// 1. Check question's own password if provided and exists
	if (managementPassword && question.managementPasswordHash) {
		return await bcrypt.compare(
			managementPassword,
			question.managementPasswordHash
		);
	}
	// 2. If no question password or not provided for auth, check if group admin
	if (managementPassword) {
		// This password might be the group's management password
		const group = await db
			.collection<DbGroup>("groups")
			.findOne({ _id: question.groupId });
		if (group && group.managementPasswordHash) {
			return await bcrypt.compare(
				managementPassword,
				group.managementPasswordHash
			);
		}
	}
	return false;
}

export async function GET(
	request: NextRequest,
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
		const validQuestionId = new ObjectId(questionIdValidation.data);

		const { db } = await connectToDatabase();
		const questionsCollection = db.collection<DbQuestion>("questions");

		// Increment views
		const updateResult = await questionsCollection.findOneAndUpdate(
			{ _id: validQuestionId },
			{ $inc: { views: 1 } },
			{ returnDocument: "after" } // Returns the updated document
		);

		if (!updateResult) {
			return NextResponse.json(
				{ message: "Question not found" },
				{ status: 404 }
			);
		}
		const question = updateResult as DbQuestion; // Type assertion after findOneAndUpdate

		return NextResponse.json(
			{ question: mapDbQuestionToFrontend(question) },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to fetch question:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
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
		const validQuestionId = new ObjectId(questionIdValidation.data);

		const body = await request.json();
		// Expect managementPassword in the body for auth, separate from updateData
		const { managementPassword, ...updatePayload } = body;

		const authValidation = QuestionManagementAuthSchema.safeParse({
			managementPassword,
		});
		if (!authValidation.success) {
			return NextResponse.json(
				{
					message: "Management password is required for update",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const updateValidation = UpdateQuestionSchema.safeParse(updatePayload);
		if (!updateValidation.success) {
			return NextResponse.json(
				{
					message: "Invalid update data",
					errors: updateValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}
		// Ensure there's something to update
		if (Object.keys(updateValidation.data).length === 0) {
			return NextResponse.json(
				{ message: "No update fields provided" },
				{ status: 400 }
			);
		}

		const { db } = await connectToDatabase();
		const questionsCollection = db.collection<DbQuestion>("questions");
		const question = await questionsCollection.findOne({
			_id: validQuestionId,
		});

		if (!question) {
			return NextResponse.json(
				{ message: "Question not found" },
				{ status: 404 }
			);
		}

		const isAuthorized = await verifyQuestionOwnership(
			db,
			question,
			authValidation.data.managementPassword
		);
		if (!isAuthorized) {
			return NextResponse.json(
				{ message: "Unauthorized to update this question" },
				{ status: 403 }
			);
		}

		const finalUpdateData = { ...updateValidation.data };
		if (finalUpdateData.title === null) {
			// Allow clearing optional title
			finalUpdateData.title = undefined;
		}

		const updateDoc = {
			$set: {
				...finalUpdateData,
				updatedAt: new Date(),
			},
		};

		const result = await questionsCollection.updateOne(
			{ _id: validQuestionId },
			[updateDoc]
		);

		if (result.matchedCount === 0) {
			return NextResponse.json(
				{
					message:
						"Question not found for update (should not happen if pre-check passed)",
				},
				{ status: 404 }
			);
		}
		if (result.modifiedCount === 0 && result.matchedCount === 1) {
			// No actual change in data, but operation was authorized
			const currentQuestion = await questionsCollection.findOne({
				_id: validQuestionId,
			});
			return NextResponse.json(
				{
					message: "No changes applied",
					question: mapDbQuestionToFrontend(currentQuestion!),
				},
				{ status: 200 }
			);
		}

		const updatedQuestion = await questionsCollection.findOne({
			_id: validQuestionId,
		});
		if (!updatedQuestion) {
			return NextResponse.json(
				{ message: "Failed to retrieve updated question" },
				{ status: 500 }
			);
		}

		// TODO: Emit Socket.io event: questionUpdated (groupId, questionData)

		return NextResponse.json(
			{ question: mapDbQuestionToFrontend(updatedQuestion) },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to update question:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
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
		const validQuestionId = new ObjectId(questionIdValidation.data);

		// Password should be in the request body for DELETE
		const body = await request.json();
		const authValidation = QuestionManagementAuthSchema.safeParse(body);

		if (!authValidation.success) {
			return NextResponse.json(
				{
					message: "Management password is required for deletion",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { db } = await connectToDatabase();
		const questionsCollection = db.collection<DbQuestion>("questions");
		const question = await questionsCollection.findOne({
			_id: validQuestionId,
		});

		if (!question) {
			return NextResponse.json(
				{ message: "Question not found" },
				{ status: 404 }
			);
		}

		const isAuthorized = await verifyQuestionOwnership(
			db,
			question,
			authValidation.data.managementPassword
		);
		if (!isAuthorized) {
			return NextResponse.json(
				{ message: "Unauthorized to delete this question" },
				{ status: 403 }
			);
		}

		// Delete associated answers first
		await db
			.collection<DbAnswer>("answers")
			.deleteMany({ questionId: validQuestionId });

		// Delete the question
		const deleteResult = await questionsCollection.deleteOne({
			_id: validQuestionId,
		});

		if (deleteResult.deletedCount === 0) {
			return NextResponse.json(
				{ message: "Failed to delete question (already deleted?)" },
				{ status: 404 } // Or 500 if it implies an issue
			);
		}

		// Decrement group's questionCount
		await db
			.collection<DbGroup>("groups")
			.updateOne(
				{ _id: question.groupId },
				{ $inc: { questionCount: -1 }, $set: { lastActivityAt: new Date() } }
			);

		// TODO: Emit Socket.io event: questionDeleted (groupId, questionId)

		return NextResponse.json(
			{ message: "Question and associated answers deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to delete question:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
