import { ObjectId } from "mongodb";

interface Media {
	_id: ObjectId;
	fileName: string;
	fileType: string; // MIME type
	url: string; // URL to the media file (e.g., S3, Vercel Blob)
	size: number; // In bytes
	linkedToType: "question" | "answer";
	linkedToId: ObjectId; // ID of the question or answer
	uploaderIdentity?: string; // Temporary session ID or similar
	createdAt: Date;
}
