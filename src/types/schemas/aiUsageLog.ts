import { z } from "zod";

export const aiUsageTypeSchema = z.enum([
	"generate_question",
	"generate_answer",
	"similar_questions",
	"chat",
]);

export const AIUsageLogSchema = z.object({
	_id: z.string(),
	groupId: z.string().optional(),
	questionId: z.string().optional(),
	usageType: aiUsageTypeSchema,
	userIdentifier: z.string(), // IP or session ID for anonymous users
	prompt: z.string(),
	response: z.string().optional(),
	tokensUsed: z.number().int().positive(),
	cost: z.number().positive(),
	createdAt: z.date(),
});

export const CreateAIUsageLogSchema = z.object({
	groupId: z.string().optional(),
	questionId: z.string().optional(),
	usageType: AIUsageLogSchema,
	userIdentifier: z.string(),
	prompt: z.string(),
	response: z.string().optional(),
	tokensUsed: z.number().int().positive(),
	cost: z.number().positive(),
});

export type AIUsageLog = z.infer<typeof AIUsageLogSchema>;
export type CreateAIUsageLog = z.infer<typeof CreateAIUsageLogSchema>;
export type AIUsageType3 = z.infer<typeof aiUsageTypeSchema>;
