import { z } from "zod";

export const MediaSchema = z.object({
	_id: z.string(),
	filename: z.string(),
	originalName: z.string(),
	mimeType: z.string(),
	size: z.number().int().positive(),
	s3Key: z.string(),
	s3Bucket: z.string(),
	uploadedBy: z.string(), // nickname
	associatedWith: z
		.object({
			type: z.enum(["question", "answer"]),
			id: z.string(),
		})
		.optional(),
	createdAt: z.date(),
});

export const CreateMediaSchema = z.object({
	originalName: z.string(),
	mimeType: z.string(),
	size: z
		.number()
		.int()
		.positive()
		.max(10 * 1024 * 1024), // 10MB max
	uploadedBy: z.string(),
});

export type Media = z.infer<typeof MediaSchema>;
export type CreateMedia = z.infer<typeof CreateMediaSchema>;
