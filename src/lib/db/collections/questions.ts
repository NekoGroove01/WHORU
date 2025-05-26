import { Collection, Filter, ObjectId, Sort } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { Question } from "@/types/schemas/question";
import bcrypt from "bcrypt";
import { GroupsCollection } from "./groups";

export class QuestionsCollection {
	private static async getCollection(): Promise<Collection<Question>> {
		const { db } = await connectToDatabase();
		return db.collection<Question>("questions");
	}

	static async findById(id: string): Promise<Question | null> {
		if (!ObjectId.isValid(id)) return null;
		const collection = await this.getCollection();
		const question = await collection.findOne({
			_id: new ObjectId(id).toString(),
		});

		if (question) {
			await collection.updateOne({ _id: question._id }, { $inc: { views: 1 } });
		}

		return question;
	}

	static async findByGroup(
		groupId: string,
		options: {
			skip?: number;
			limit?: number;
			tags?: string[];
			sortBy?: "recent" | "popular" | "unanswered";
		} = {}
	): Promise<{ questions: Question[]; total: number }> {
		const collection = await this.getCollection();
		const query: Filter<Question> = { groupId };

		if (options.tags && options.tags.length > 0) {
			query.tags = { $in: options.tags };
		}

		let sortOptions: Sort = { createdAt: -1 };
		if (options.sortBy === "popular") {
			sortOptions = { upvotes: -1, views: -1 };
		} else if (options.sortBy === "unanswered") {
			query.isAnswered = false;
		}

		const [questions, total] = await Promise.all([
			collection
				.find(query)
				.sort(sortOptions)
				.skip(options.skip ?? 0)
				.limit(options.limit ?? 20)
				.toArray(),
			collection.countDocuments(query),
		]);

		return { questions, total };
	}

	static async create(data: {
		groupId: string;
		title?: string;
		content: string;
		authorNickname: string;
		authorPassword: string;
		tags?: string[];
		mediaIds?: string[];
	}): Promise<Question> {
		const collection = await this.getCollection();
		const hashedPassword = await bcrypt.hash(data.authorPassword, 10);

		const now = new Date();
		const question: Question = {
			_id: new ObjectId().toString(),
			groupId: data.groupId,
			title: data.title ?? null,
			content: data.content,
			authorNickname: data.authorNickname,
			authorPassword: hashedPassword,
			tags: data.tags || [],
			answerCount: 0,
			isAnswered: false,
			isResolvedByAsker: false,
			upvotes: 0,
			views: 0,
			mediaIds: data.mediaIds || [],
			createdAt: now,
			updatedAt: now,
		};

		await collection.insertOne(question);
		await GroupsCollection.incrementQuestionCount(data.groupId);

		return question;
	}

	static async update(
		id: string,
		data: {
			title?: string | null;
			content?: string;
			tags?: string[];
		},
		authorPassword: string
	): Promise<Question | null> {
		if (!ObjectId.isValid(id)) return null;

		const collection = await this.getCollection();
		const question = await this.findById(id);

		if (!question) return null;

		const isValidPassword = await bcrypt.compare(
			authorPassword,
			question.authorPassword
		);
		if (!isValidPassword) throw new Error("Invalid author password");

		const result = await collection.findOneAndUpdate(
			{ _id: id },
			{
				$set: {
					...data,
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
		const question = await this.findById(id);

		if (!question) return false;

		const isValidPassword = await bcrypt.compare(
			authorPassword,
			question.authorPassword
		);
		if (!isValidPassword) throw new Error("Invalid author password");

		const result = await collection.deleteOne({ _id: id });

		if (result.deletedCount === 1) {
			await GroupsCollection.decrementQuestionCount(question.groupId);
		}

		return result.deletedCount === 1;
	}

	static async upvote(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne({ _id: id }, { $inc: { upvotes: 1 } });
	}

	static async markAsAnswered(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne({ _id: id }, { $set: { isAnswered: true } });
	}

	static async incrementAnswerCount(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne({ _id: id }, { $inc: { answerCount: 1 } });
	}

	static async decrementAnswerCount(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne({ _id: id }, { $inc: { answerCount: -1 } });
	}
}
