import { z } from "zod";

export const AnswerSchema = z.object({
	_id: z.string(),
	questionId: z.string(),
	groupId: z.string(),
	content: z.string().min(1).max(5000),
	authorNickname: z.string().min(1).max(50),
	authorPassword: z.string(), // Hashed, for editing
	upvotes: z.number().int().min(0).default(0),
	isAccepted: z.boolean().default(false),
	mediaIds: z.array(z.string()).default([]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateAnswerSchema = z.object({
	questionId: z.string(),
	content: z.string().min(1).max(5000),
	authorNickname: z.string().min(1).max(50),
	authorPassword: z.string().min(4),
	mediaIds: z.array(z.string()).optional(),
});

export const UpdateAnswerSchema = z.object({
	content: z.string().min(1).max(5000),
	authorPassword: z.string().min(4),
});

export const VoteAnswerSchema = z.object({
	voteType: z.enum(["upvote", "downvote"]),
});

export type Answer = z.infer<typeof AnswerSchema>;
export type CreateAnswer = z.infer<typeof CreateAnswerSchema>;
export type UpdateAnswer = z.infer<typeof UpdateAnswerSchema>;
