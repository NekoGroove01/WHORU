import { Collection, ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { Group } from "@/types/schemas/group";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export class GroupsCollection {
	private static async getCollection(): Promise<Collection<Group>> {
		const { db } = await connectToDatabase();
		return db.collection<Group>("groups");
	}

	static async findById(id: string): Promise<Group | null> {
		if (!ObjectId.isValid(id)) return null;
		const collection = await this.getCollection();
		return collection.findOne({ _id: new ObjectId(id).toString() });
	}

	static async findByAccessKey(accessKey: string): Promise<Group | null> {
		if (!accessKey || accessKey.trim() === "") return null;
		const collection = await this.getCollection();
		return collection.findOne({ accessKey });
	}

	static async findPublicGroups(
		skip: number = 0,
		limit: number = 20
	): Promise<{ groups: Group[]; total: number }> {
		const collection = await this.getCollection();
		const query = { isPublic: true };

		const [groups, total] = await Promise.all([
			collection
				.find(query)
				.sort({ lastActivityAt: -1 })
				.skip(skip)
				.limit(limit)
				.toArray(),
			collection.countDocuments(query),
		]);

		return { groups, total };
	}

	static async create(data: {
		name: string;
		description?: string;
		isPublic: boolean;
		adminPassword: string;
		tags?: string[];
	}): Promise<Group> {
		const collection = await this.getCollection();
		const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

		const now = new Date();
		const group: Group = {
			_id: new ObjectId().toString(),
			name: data.name,
			description: data.description ?? null,
			isPublic: data.isPublic,
			adminPassword: hashedPassword,
			accessKey: !data.isPublic ? nanoid(10) : undefined,
			tags: data.tags || [],
			questionCount: 0,
			lastActivityAt: now,
			createdAt: now,
			updatedAt: now,
		};

		await collection.insertOne(group);
		return group;
	}

	static async update(
		id: string,
		data: Partial<Group>,
		adminPassword: string
	): Promise<Group | null> {
		if (!ObjectId.isValid(id)) return null;

		const collection = await this.getCollection();
		const group = await this.findById(id);

		if (!group) return null;

		// Debug logging for password comparison
		console.log("AdminPassword received:", adminPassword);
		console.log("Group adminPassword from DB:", group.adminPassword);
		console.log("AdminPassword type:", typeof adminPassword);
		console.log("Group adminPassword type:", typeof group.adminPassword);

		// Validate passwords before bcrypt comparison
		if (!adminPassword || typeof adminPassword !== "string") {
			throw new Error("Admin password is required and must be a string");
		}

		if (!group.adminPassword || typeof group.adminPassword !== "string") {
			throw new Error("Group admin password is not properly set");
		}

		const isValidPassword = await bcrypt.compare(
			adminPassword,
			group.adminPassword
		);
		if (!isValidPassword) throw new Error("Invalid admin password");

		// Don't include adminPassword in updateData to avoid overwriting it
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { adminPassword: _unused, ...dataWithoutPassword } = data;
		const updateData = {
			...dataWithoutPassword,
			updatedAt: new Date(),
		};

		const result = await collection.findOneAndUpdate(
			{ _id: id },
			{ $set: updateData },
			{ returnDocument: "after" }
		);

		return result ?? null;
	}

	/**
	 * Update admin password for a group
	 * @param groupId - The group ID
	 * @param hashedPassword - The new hashed password
	 * @returns Updated group
	 */
	static async updateAdminPassword(
		groupId: string,
		hashedPassword: string
	): Promise<Group | null> {
		const collection = await this.getCollection();

		const result = await collection.findOneAndUpdate(
			{ _id: groupId },
			{
				$set: {
					adminPassword: hashedPassword,
					updatedAt: new Date(),
				},
			},
			{ returnDocument: "after" }
		);

		return result ?? null;
	}

	static async delete(id: string, adminPassword: string): Promise<boolean> {
		if (!ObjectId.isValid(id)) return false;

		const collection = await this.getCollection();
		const group = await this.findById(id);

		if (!group) return false;

		const isValidPassword = await bcrypt.compare(
			adminPassword,
			group.adminPassword
		);
		if (!isValidPassword) throw new Error("Invalid admin password");

		const result = await collection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}

	static async incrementQuestionCount(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne(
			{ _id: id },
			{
				$inc: { questionCount: 1 },
				$set: { lastActivityAt: new Date() },
			}
		);
	}

	static async decrementQuestionCount(id: string): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne(
			{ _id: id },
			{
				$inc: { questionCount: -1 },
				$set: { lastActivityAt: new Date() },
			}
		);
	}

	static async verifyAccessKey(
		id: string,
		accessKey: string
	): Promise<boolean> {
		const group = await this.findById(id);
		if (!group || group.isPublic) return true;
		return group.accessKey === accessKey;
	}

	static async verifyAdminPassword(
		id: string,
		password: string
	): Promise<boolean> {
		const group = await this.findById(id);
		if (!group) return false;
		return bcrypt.compare(password, group.adminPassword);
	}
}
