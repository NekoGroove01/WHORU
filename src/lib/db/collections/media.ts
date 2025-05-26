import { Collection, ObjectId } from "mongodb";
import { connectToDatabase } from "@/utils/mongodb";
import { Media } from "@/types/schemas/media";
import { nanoid } from "nanoid";

export class MediaCollection {
	private static async getCollection(): Promise<Collection<Media>> {
		const { db } = await connectToDatabase();
		return db.collection<Media>("media");
	}

	static async findById(id: string): Promise<Media | null> {
		if (!ObjectId.isValid(id)) return null;
		const collection = await this.getCollection();
		return collection.findOne({ _id: new ObjectId(id).toString() });
	}

	static async findByIds(ids: string[]): Promise<Media[]> {
		const collection = await this.getCollection();
		return collection.find({ _id: { $in: ids } }).toArray();
	}

	static async create(data: {
		originalName: string;
		mimeType: string;
		size: number;
		uploadedBy: string;
		s3Key?: string;
		s3Bucket?: string;
	}): Promise<Media> {
		const collection = await this.getCollection();

		const media: Media = {
			_id: new ObjectId().toString(),
			filename: `${nanoid()}-${data.originalName}`,
			originalName: data.originalName,
			mimeType: data.mimeType,
			size: data.size,
			s3Key: data.s3Key ?? "",
			s3Bucket: data.s3Bucket ?? process.env.AWS_S3_BUCKET ?? "",
			uploadedBy: data.uploadedBy,
			createdAt: new Date(),
		};

		await collection.insertOne(media);
		return media;
	}

	static async associateWithContent(
		mediaId: string,
		contentType: "question" | "answer",
		contentId: string
	): Promise<void> {
		const collection = await this.getCollection();
		await collection.updateOne(
			{ _id: mediaId },
			{
				$set: {
					associatedWith: {
						type: contentType,
						id: contentId,
					},
				},
			}
		);
	}

	static async deleteByContentId(
		contentType: "question" | "answer",
		contentId: string
	): Promise<number> {
		const collection = await this.getCollection();
		const result = await collection.deleteMany({
			"associatedWith.type": contentType,
			"associatedWith.id": contentId,
		});
		return result.deletedCount;
	}

	static async delete(id: string): Promise<boolean> {
		if (!ObjectId.isValid(id)) return false;
		const collection = await this.getCollection();
		const result = await collection.deleteOne({ _id: id });
		return result.deletedCount === 1;
	}
}
