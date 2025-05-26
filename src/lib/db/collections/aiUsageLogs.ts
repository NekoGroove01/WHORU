import { Collection, Filter, ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { AIUsageLog, AIUsageType3 } from "@/types/schemas/aiUsageLog";

export class AIUsageLogsCollection {
	private static async getCollection(): Promise<Collection<AIUsageLog>> {
		const { db } = await connectToDatabase();
		return db.collection<AIUsageLog>("ai_usage_logs");
	}

	static async create(data: {
		groupId?: string;
		questionId?: string;
		usageType: AIUsageType3;
		userIdentifier: string;
		prompt: string;
		response?: string;
		tokensUsed: number;
		cost: number;
	}): Promise<AIUsageLog> {
		const collection = await this.getCollection();

		const log: AIUsageLog = {
			_id: new ObjectId().toString(),
			...data,
			createdAt: new Date(),
		};

		await collection.insertOne(log);
		return log;
	}

	static async getUsageCount(
		userIdentifier: string,
		usageType: AIUsageType3,
		questionId?: string,
		since?: Date
	): Promise<number> {
		const collection = await this.getCollection();
		const query: Filter<AIUsageLog> = {
			userIdentifier,
			usageType,
		};

		if (questionId) {
			query.questionId = questionId;
		}

		if (since) {
			query.createdAt = { $gte: since };
		}

		return collection.countDocuments(query);
	}

	static async getGroupUsageStats(
		groupId: string,
		since?: Date
	): Promise<{
		totalUsage: number;
		totalCost: number;
		byType: Record<string, number>;
	}> {
		const collection = await this.getCollection();
		const query: Filter<AIUsageLog> = { groupId };

		if (since) {
			query.createdAt = { $gte: since };
		}

		const logs = await collection.find(query).toArray();

		const stats = {
			totalUsage: logs.length,
			totalCost: logs.reduce((sum, log) => sum + log.cost, 0),
			byType: {} as Record<string, number>,
		};

		logs.forEach((log) => {
			stats.byType[log.usageType] = (stats.byType[log.usageType] || 0) + 1;
		});

		return stats;
	}
}
