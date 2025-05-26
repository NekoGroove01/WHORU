import { connectToDatabase } from "@/utils/mongodb";

export async function createIndexes(): Promise<void> {
	const { db } = await connectToDatabase();

	// Groups indexes
	await db
		.collection("groups")
		.createIndexes([
			{ key: { isPublic: 1, lastActivityAt: -1 } },
			{ key: { tags: 1 } },
			{ key: { accessKey: 1 } },
		]);

	// Questions indexes
	await db
		.collection("questions")
		.createIndexes([
			{ key: { groupId: 1, createdAt: -1 } },
			{ key: { groupId: 1, tags: 1 } },
			{ key: { groupId: 1, isAnswered: 1 } },
			{ key: { groupId: 1, upvotes: -1 } },
		]);

	// Answers indexes
	await db
		.collection("answers")
		.createIndexes([
			{ key: { questionId: 1, createdAt: -1 } },
			{ key: { questionId: 1, upvotes: -1 } },
			{ key: { groupId: 1 } },
		]);

	// Media indexes
	await db
		.collection("media")
		.createIndexes([
			{ key: { "associatedWith.type": 1, "associatedWith.id": 1 } },
			{ key: { s3Key: 1 } },
		]);

	// AI Usage Logs indexes
	await db
		.collection("ai_usage_logs")
		.createIndexes([
			{ key: { userIdentifier: 1, usageType: 1, createdAt: -1 } },
			{ key: { groupId: 1, createdAt: -1 } },
			{ key: { questionId: 1 } },
		]);
}
