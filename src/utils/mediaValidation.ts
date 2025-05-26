import { z } from "zod";

const ALLOWED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/webm"];

export const ALLOWED_FILE_TYPES = [
	...ALLOWED_IMAGE_TYPES,
	...ALLOWED_VIDEO_TYPES,
	...ALLOWED_AUDIO_TYPES,
];

export const mediaUploadSchema = z.object({
	fileName: z.string().min(1).max(255),
	fileType: z
		.string()
		.refine((type) => ALLOWED_FILE_TYPES.includes(type), {
			message: "Invalid file type",
		}),
	fileSize: z
		.number()
		.positive()
		.max(10 * 1024 * 1024), // 10MB max
});

export const mediaLinkSchema = z.object({
	fileKey: z.string().min(1),
	linkedToType: z.enum(["question", "answer"]),
	linkedToId: z.string().min(1),
	metadata: z
		.object({
			width: z.number().positive().optional(),
			height: z.number().positive().optional(),
			duration: z.number().positive().optional(),
		})
		.optional(),
});

export function generateS3Key(
	linkedToType: "question" | "answer",
	linkedToId: string,
	fileName: string
): string {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 8);
	const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

	return `${linkedToType}s/${linkedToId}/${timestamp}-${randomString}-${sanitizedFileName}`;
}

export function getFileCategory(
	mimeType: string
): "image" | "video" | "audio" | "unknown" {
	if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return "image";
	if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return "video";
	if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return "audio";
	return "unknown";
}
