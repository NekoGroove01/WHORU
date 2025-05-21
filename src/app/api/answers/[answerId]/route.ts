import { NextResponse, NextRequest } from "next/server";
import { Db, Document, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import {
	UpdateAnswerSchema,
	ManageAnswerSchema,
	MongoIdSchema,
} from "@/utils/schemas";
import { Answer } from "@/types/answer"; // Frontend type

// --- Helper Functions ---

/**
 * Parses and validates the answer ID from path parameters.
 */
function parseAnswerId(params: { answerId: string }): {
	answerObjectId?: ObjectId;
	errorResponse?: NextResponse;
} {
	const answerIdValidation = MongoIdSchema.safeParse(params.answerId);
	if (!answerIdValidation.success) {
		return {
			errorResponse: NextResponse.json(
				{ message: "Invalid answer ID format" },
				{ status: 400 }
			),
		};
	}
	return { answerObjectId: new ObjectId(answerIdValidation.data) };
}

/**
 * Fetches an answer document from the database.
 */
async function getAnswerDocument(
	db: Db,
	answerId: ObjectId
): Promise<Document | null> {
	return db.collection("answers").findOne({ _id: answerId });
}

/**
 * Verifies management access to an answer (e.g., password check).
 */
async function verifyManagementAccess(
	answerDoc: Document | null,
	managementPassword?: string
): Promise<{ authorized: boolean; status?: number; message?: string }> {
	if (!answerDoc) {
		return { authorized: false, status: 404, message: "Answer not found" };
	}

	if (answerDoc.managementPasswordHash) {
		if (!managementPassword) {
			return {
				authorized: false,
				status: 401,
				message: "Management password required",
			};
		}
		const isPasswordValid = await bcrypt.compare(
			managementPassword,
			answerDoc.managementPasswordHash
		);
		if (!isPasswordValid) {
			return {
				authorized: false,
				status: 403,
				message: "Invalid management password",
			};
		}
	}
	return { authorized: true };
}

/**
 * Maps a MongoDB answer document to the frontend Answer type.
 */
function mapToAnswerResponse(answerDoc: Document): Answer {
	return {
		id: answerDoc._id.toHexString(),
		questionId: answerDoc.questionId.toHexString(),
		groupId: answerDoc.groupId.toHexString(),
		content: answerDoc.content,
		authorNickname: answerDoc.authorNickname,
		upvotes: answerDoc.upvotes,
		isAccepted: answerDoc.isAccepted,
		createdAt: answerDoc.createdAt.toISOString(),
		updatedAt: answerDoc.updatedAt.toISOString(),
	};
}

/**
 * Handles common error scenarios.
 */
function handleError(error: unknown): NextResponse {
	console.error("API Error:", error);
	if (error instanceof Error && error.message.includes("ObjectId")) {
		return NextResponse.json(
			{ message: "Invalid ID format provided" },
			{ status: 400 }
		);
	}
	return NextResponse.json(
		{ message: "Internal server error" },
		{ status: 500 }
	);
}

// --- API Handlers ---

export async function PUT(
	request: NextRequest,
	{ params }: { params: { answerId: string } }
) {
	try {
		const { answerObjectId, errorResponse: idError } = parseAnswerId(params);
		if (idError) return idError;

		const body = await request.json();
		const validation = UpdateAnswerSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid input", errors: validation.error.errors },
				{ status: 400 }
			);
		}
		const { content, managementPassword } = validation.data;

		const { db } = await connectToDatabase();
		const existingAnswer = await getAnswerDocument(db, answerObjectId!);

		const access = await verifyManagementAccess(
			existingAnswer,
			managementPassword
		);
		if (!access.authorized) {
			return NextResponse.json(
				{ message: access.message },
				{ status: access.status }
			);
		}

		const now = new Date();
		const updateResult = await db
			.collection("answers")
			.findOneAndUpdate(
				{ _id: answerObjectId },
				{ $set: { content, updatedAt: now } },
				{ returnDocument: "after" }
			);

		if (!updateResult) {
			// findOneAndUpdate returns null if no document matched
			return NextResponse.json(
				{ message: "Answer not found or no changes made" },
				{ status: 404 }
			);
		}

		const updatedAnswerResponse = mapToAnswerResponse(updateResult);

		// TODO: Emit Socket.io event: answerUpdated (groupId, questionId, updatedAnswerResponse)

		return NextResponse.json(updatedAnswerResponse);
	} catch (error) {
		return handleError(error);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { answerId: string } }
) {
	try {
		const { answerObjectId, errorResponse: idError } = parseAnswerId(params);
		if (idError) return idError;

		let managementPassword: string | undefined;
		// Password for DELETE might be in a simple JSON body.
		try {
			const body = await request.json();
			const validation = ManageAnswerSchema.safeParse(body);
			if (validation.success) {
				managementPassword = validation.data.managementPassword;
			}
		} catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Unknown error";
			console.debug("Failed to parse JSON body for DELETE:", errorMessage);
		}

		const { db } = await connectToDatabase();
		const answerToDelete = await getAnswerDocument(db, answerObjectId!);

		const access = await verifyManagementAccess(
			answerToDelete,
			managementPassword
		);
		if (!access.authorized) {
			return NextResponse.json(
				{ message: access.message },
				{ status: access.status }
			);
		}

		// Ensure answerToDelete is not null before accessing its properties
		if (!answerToDelete) {
			// This case should have been caught by verifyManagementAccess, but as a safeguard:
			return NextResponse.json(
				{ message: "Answer not found" },
				{ status: 404 }
			);
		}

		const deleteResult = await db
			.collection("answers")
			.deleteOne({ _id: answerObjectId });

		if (deleteResult.deletedCount === 0) {
			// Should ideally be caught by getAnswerDocument, but as a fallback.
			return NextResponse.json(
				{ message: "Answer not found during delete operation" },
				{ status: 404 }
			);
		}

		// Update question's answerCount
		await db
			.collection("questions")
			.updateOne(
				{ _id: answerToDelete.questionId },
				{ $inc: { answerCount: -1 } }
			);

		// TODO: Emit Socket.io event: answerDeleted (groupId, questionId, answerIdString)

		return NextResponse.json(
			{ message: "Answer deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		return handleError(error);
	}
}
