import { z } from "zod";

export const QuestionSchema = z.object({
	_id: z.string(),
	groupId: z.string(),
	title: z.string().max(200).nullable(),
	content: z.string().min(1).max(5000),
	authorNickname: z.string().min(1).max(50),
	authorPassword: z.string(), // Hashed, for editing
	tags: z.array(z.string()).max(5),
	answerCount: z.number().int().min(0).default(0),
	isAnswered: z.boolean().default(false),
	isResolvedByAsker: z.boolean().default(false),
	upvotes: z.number().int().min(0).default(0),
	views: z.number().int().min(0).default(0),
	mediaIds: z.array(z.string()).default([]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CreateQuestionSchema = z.object({
	groupId: z.string(),
	title: z.string().max(200).optional(),
	content: z.string().min(1).max(5000),
	authorNickname: z.string().min(1).max(50),
	authorPassword: z.string().min(6),
	tags: z.array(z.string()).max(5).default([]),
	mediaIds: z.array(z.string()).optional(),
});

export const UpdateQuestionSchema = z.object({
	title: z.string().max(200).nullable().optional(),
	content: z.string().min(1).max(5000).optional(),
	tags: z.array(z.string()).max(5).optional(),
	authorPassword: z.string().min(6),
});

export type Question = z.infer<typeof QuestionSchema>;
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>;
