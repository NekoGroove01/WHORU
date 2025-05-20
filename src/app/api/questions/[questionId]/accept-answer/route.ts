// src/app/api/questions/[questionId]/accept-answer/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId, type Db, ClientSession } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import {
	MongoIdSchema,
	AcceptAnswerSchema,
	QuestionManagementAuthSchema,
} from "@/utils/schemas";
import type { Question as FrontendQuestion } from "@/types/question";
import type { Answer as FrontendAnswer } from "@/types/answer";
import type { DbQuestion } from "@/types/schemas/question";
import type { DbAnswer } from "@/types/schemas/answer";
import type { DbGroup } from "@/types/schemas/group";

// --- Helper: Validation and Input Parsing ---
interface ValidatedAcceptAnswerInputs {
	validQuestionId: ObjectId;
	validAnswerId: ObjectId;
	managementPasswordToVerify: string;
}

async function validateAndParseInputs(
	request: NextRequest,
	params: { questionId: string }
): Promise<
	{ data: ValidatedAcceptAnswerInputs } | { errorResponse: NextResponse }
> {
	const questionIdValidation = MongoIdSchema.safeParse(params.questionId);
	if (!questionIdValidation.success) {
		return {
			errorResponse: NextResponse.json(
				{ message: "Invalid question ID format" },
				{ status: 400 }
			),
		};
	}

	let body;
	try {
		body = await request.json();
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : "Unknown error";
		return {
			errorResponse: NextResponse.json(
				{ message: `Invalid JSON body: ${errorMessage}` },
				{ status: 400 }
			),
		};
	}

	const { answerId, managementPassword } = body;

	const payloadValidation = AcceptAnswerSchema.safeParse({ answerId });
	if (!payloadValidation.success) {
		return {
			errorResponse: NextResponse.json(
				{
					message: "Invalid answer ID",
					errors: payloadValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			),
		};
	}

	const authValidation = QuestionManagementAuthSchema.safeParse({
		managementPassword,
	});
	if (!authValidation.success) {
		return {
			errorResponse: NextResponse.json(
				{
					message: "Management password is required",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			),
		};
	}

	return {
		data: {
			validQuestionId: new ObjectId(questionIdValidation.data),
			validAnswerId: new ObjectId(payloadValidation.data.answerId),
			managementPasswordToVerify: authValidation.data.managementPassword,
		},
	};
}

// --- Helper: Authorization and Entity Fetching (within session) ---
interface FetchedEntities {
	question: DbQuestion;
	answer: DbAnswer;
}
async function fetchAndAuthorizeEntities(
	db: Db,
	session: ClientSession,
	questionId: ObjectId,
	answerId: ObjectId,
	managementPasswordToVerify: string
): Promise<{ data: FetchedEntities } | { errorResponse: NextResponse }> {
	const questionsCollection = db.collection<DbQuestion>("questions");
	const answersCollection = db.collection<DbAnswer>("answers");

	const question = await questionsCollection.findOne(
		{ _id: questionId },
		{ session }
	);
	if (!question) {
		return {
			errorResponse: NextResponse.json(
				{ message: "Question not found" },
				{ status: 404 }
			),
		};
	}

	const isAuthorized = await verifyQuestionOwnership(
		db,
		question,
		managementPasswordToVerify
	);
	if (!isAuthorized) {
		return {
			errorResponse: NextResponse.json(
				{ message: "Unauthorized to modify this question" },
				{ status: 403 }
			),
		};
	}

	const answer = await answersCollection.findOne(
		{ _id: answerId, questionId: questionId },
		{ session }
	);
	if (!answer) {
		return {
			errorResponse: NextResponse.json(
				{ message: "Answer not found or does not belong to this question" },
				{ status: 404 }
			),
		};
	}
	if (answer.isAccepted) {
		return {
			errorResponse: NextResponse.json(
				{ message: "This answer is already accepted." },
				{ status: 409 }
			),
		};
	}

	return { data: { question, answer } };
}

// --- Helper: Question Ownership Verification ---
async function verifyQuestionOwnership(
	db: Db,
	question: DbQuestion,
	managementPassword?: string
): Promise<boolean> {
	if (managementPassword && question.managementPasswordHash) {
		return await bcrypt.compare(
			managementPassword,
			question.managementPasswordHash
		);
	}
	if (managementPassword) {
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

// --- Helper: Data Mapping ---
function mapDbQuestionToFrontend(dbQuestion: DbQuestion): FrontendQuestion {
	// ... (implementation as before)
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

function mapDbAnswerToFrontend(dbAnswer: DbAnswer): FrontendAnswer {
	// ... (implementation as before)
	return {
		id: dbAnswer._id.toHexString(),
		questionId: dbAnswer.questionId.toHexString(),
		groupId: dbAnswer.groupId.toHexString(),
		content: dbAnswer.content,
		authorNickname: dbAnswer.authorNickname,
		upvotes: dbAnswer.upvotes,
		isAccepted: dbAnswer.isAccepted,
		createdAt: dbAnswer.createdAt.toISOString(),
		updatedAt: dbAnswer.updatedAt.toISOString(),
	};
}

// --- Helper: Transaction Logic ---
async function performAcceptAnswerTransaction(
	db: Db,
	session: ClientSession,
	validQuestionId: ObjectId,
	validAnswerId: ObjectId,
	now: Date
): Promise<{ updatedQuestion: DbQuestion; acceptedAnswer: DbAnswer }> {
	// Not nullable here, as failure aborts
	const questionsCollection = db.collection<DbQuestion>("questions");
	const answersCollection = db.collection<DbAnswer>("answers");

	await answersCollection.updateMany(
		{ questionId: validQuestionId, _id: { $ne: validAnswerId } },
		{ $set: { isAccepted: false, updatedAt: now } },
		{ session }
	);

	const acceptedAnswerUpdateResult = await answersCollection.findOneAndUpdate(
		{ _id: validAnswerId, questionId: validQuestionId },
		{ $set: { isAccepted: true, updatedAt: now } },
		{ returnDocument: "after", session }
	);
	if (!acceptedAnswerUpdateResult) {
		// No need to explicitly abort here, the caller will if this throws
		console.error("Transaction error: Failed to mark answer as accepted.");
		throw new Error("Failed to accept answer during transaction.");
	}
	const acceptedAnswer = acceptedAnswerUpdateResult as DbAnswer;

	const updatedQuestionResult = await questionsCollection.findOneAndUpdate(
		{ _id: validQuestionId },
		{ $set: { isAnswered: true, updatedAt: now } },
		{ returnDocument: "after", session }
	);

	if (!updatedQuestionResult) {
		console.error("Transaction error: Failed to update question status.");
		throw new Error(
			"Failed to update question status after accepting answer during transaction."
		);
	}
	const updatedQuestion = updatedQuestionResult as DbQuestion;

	return { updatedQuestion, acceptedAnswer };
}

// --- API Endpoint ---
export async function POST(
	request: NextRequest,
	{ params }: { params: { questionId: string } }
) {
	// 1. Validate Inputs
	const validation = await validateAndParseInputs(request, params);
	if ("errorResponse" in validation) {
		return validation.errorResponse;
	}
	const { validQuestionId, validAnswerId, managementPasswordToVerify } =
		validation.data;

	const { client, db } = await connectToDatabase();
	const session = client.startSession();

	try {
		session.startTransaction();

		// 2. Fetch and Authorize Entities
		const entitiesResult = await fetchAndAuthorizeEntities(
			db,
			session,
			validQuestionId,
			validAnswerId,
			managementPasswordToVerify
		);

		if ('errorResponse' in entitiesResult) {
			await session.abortTransaction();
			return entitiesResult.errorResponse;
		}
		// No need to use entitiesResult.data.question or .answer here,
		// as performAcceptAnswerTransaction will re-fetch or operate on IDs.

		// 3. Perform Transaction
		const now = new Date();
		const { updatedQuestion, acceptedAnswer } =
			await performAcceptAnswerTransaction(
				db,
				session,
				validQuestionId,
				validAnswerId,
				now
			);

		await session.commitTransaction();

		// TODO: Emit Socket.io events

		return NextResponse.json(
			{
				message: "Answer accepted successfully",
				question: mapDbQuestionToFrontend(updatedQuestion),
				answer: mapDbAnswerToFrontend(acceptedAnswer),
			},
			{ status: 200 }
		);
	} catch (error: unknown) {
		// Explicitly type error as unknown
		console.error("Transaction or operation failed in accept-answer:", error);
		if (session.inTransaction()) {
			await session.abortTransaction();
		}
		// Check if it's an error we threw from transaction helper
		if (
			error instanceof Error &&
			(error.message.includes("Failed to accept answer") ||
				error.message.includes("Failed to update question status"))
		) {
			return NextResponse.json({ message: error.message }, { status: 500 });
		}
		return NextResponse.json(
			{ message: "Internal server error during accept answer process" },
			{ status: 500 }
		);
	} finally {
		await session.endSession();
	}
}
