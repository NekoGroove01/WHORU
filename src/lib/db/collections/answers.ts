import { Collection, ObjectId, Sort } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { Answer } from "@/types/schemas/answer";
import bcrypt from "bcrypt";
import { QuestionsCollection } from "./questions";

export class AnswersCollection {
	private static async getCollection(): Promise<Collection<Answer>> {
		const { db } = await connectToDatabase();
		return db.collection<Answer>("answers");
	}

	static async findById(id: string): Promise<Answer | null> {
		if (!ObjectId.isValid(id)) return null;
		const collection = await this.getCollection();
		return collection.findOne({ _id: new ObjectId(id).toString() });
	}

	static async findByQuestion(
		questionId: string,
		options: {
			skip?: number;
			limit?: number;
			sortBy?: "newest" | "oldest" | "votes";
		} = {}
	): Promise<{ answers: Answer[]; total: number }> {
		const collection = await this.getCollection();
		const query = { questionId };

		let sortOptions: Sort = { createdAt: -1 };
		if (options.sortBy === "oldest") {
			sortOptions = { createdAt: 1 };
		} else if (options.sortBy === "votes") {
			sortOptions = { upvotes: -1, createdAt: -1 };
		}

		const [answers, total] = await Promise.all([
			collection
				.find(query)
				.sort(sortOptions)
				.skip(options.skip ?? 0)
				.limit(options.limit ?? 50)
				.toArray(),
			collection.countDocuments(query),
		]);

		return { answers, total };
	}

	static async create(data: {
		questionId: string;
		content: string;
		authorNickname: string;
		authorPassword: string;
		mediaIds?: string[];
	}): Promise<Answer> {
		const collection = await this.getCollection();
		const hashedPassword = await bcrypt.hash(data.authorPassword, 10);

		// Get groupId from question
		const question = await QuestionsCollection.findById(data.questionId);
		if (!question) throw new Error("Question not found");

		const now = new Date();
		const answer: Answer = {
			_id: new ObjectId().toString(),
			questionId: data.questionId,
			groupId: question.groupId,
			content: data.content,
			authorNickname: data.authorNickname,
			authorPassword: hashedPassword,
			upvotes: 0,
			isAccepted: false,
			mediaIds: data.mediaIds || [],
			createdAt: now,
			updatedAt: now,
		};

		await collection.insertOne(answer);
		await QuestionsCollection.incrementAnswerCount(data.questionId);

		return answer;
	}

	static async update(
		id: string,
		content: string,
		authorPassword: string
	): Promise<Answer | null> {
		if (!ObjectId.isValid(id)) return null;

		const collection = await this.getCollection();
		const answer = await this.findById(id);

		if (!answer) return null;

		const isValidPassword = await bcrypt.compare(
			authorPassword,
			answer.authorPassword
		);
		if (!isValidPassword) throw new Error("Invalid author password");

		const result = await collection.findOneAndUpdate(
			{ _id: id },
			{
				$set: {
					content,
					updatedAt: new Date(),
				},
			},
			{ returnDocument: "after" }
		);

		return result ?? null;
	}

	static async delete(id: string, authorPassword: string): Promise<boolean> {
		if (!ObjectId.isValid(id)) return false;

		const collection = await this.getCollection();
		const answer = await this.findById(id);

		if (!answer) return false;

		const isValidPassword = await bcrypt.compare(
			authorPassword,
			answer.authorPassword
		);
		if (!isValidPassword) throw new Error("Invalid author password");

		const result = await collection.deleteOne({ _id: id });

		if (result.deletedCount === 1) {
			await QuestionsCollection.decrementAnswerCount(answer.questionId);
		}

		return result.deletedCount === 1;
	}

	static async upvote(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne({ _id: id }, { $inc: { upvotes: 1 } });
	}

	static async acceptAnswer(
		answerId: string,
		questionId: string,
		questionAuthorPassword: string
	): Promise<boolean> {
		const question = await QuestionsCollection.findById(questionId);
		if (!question) return false;

		const isValidPassword = await bcrypt.compare(
			questionAuthorPassword,
			question.authorPassword
		);
		if (!isValidPassword) throw new Error("Invalid question author password");

		const collection = await this.getCollection();

		// Unaccept all other answers for this question
		await collection.updateMany(
			{ questionId },
			{ $set: { isAccepted: false } }
		);

		// Accept this answer
		const result = await collection.updateOne(
			{ _id: answerId, questionId },
			{ $set: { isAccepted: true } }
		);

		if (result.modifiedCount === 1) {
			await QuestionsCollection.markAsAnswered(questionId);
		}

		return result.modifiedCount === 1;
	}
}
