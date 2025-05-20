// src/utils/schemas.ts
import { z } from "zod";

// --- Common Schemas ---
export const MongoIdSchema = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"); // For validating string representations of MongoDB ObjectIds

export const PasswordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.max(100, "Password must be at most 100 characters long");
// .regex(/[a-z]/, "Password must contain at least one lowercase letter") // Optional: add complexity
// .regex(/[A-Z]/, "Password must contain at least one uppercase letter") // Optional: add complexity
// .regex(/[0-9]/, "Password must contain at least one number")           // Optional: add complexity
// .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"); // Optional: add complexity

export const TagSchema = z
	.string()
	.min(1, "Tag cannot be empty")
	.max(50, "Tag is too long");
export const TagsArraySchema = z
	.array(TagSchema)
	.max(10, "Maximum of 10 tags allowed");

export const NicknameSchema = z
	.string()
	.min(2, "Nickname too short")
	.max(30, "Nickname too long");

// --- Group Schemas ---
export const GroupBaseSchema = z.object({
	name: z
		.string()
		.min(3, "Group name must be at least 3 characters long")
		.max(100, "Group name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
	isPublic: z.boolean().default(true),
	tags: TagsArraySchema.optional().default([]), // Tags defined by group admin for question categorization
});

export const CreateGroupSchema = GroupBaseSchema.extend({
	managementPassword: PasswordSchema,
});
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = z.object({
	name: z.string().min(3).max(100).optional(),
	description: z.string().max(500).optional().nullable(), // Allow setting to null to clear
	isPublic: z.boolean().optional(),
	tags: TagsArraySchema.optional(),
});
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;

export const GroupManagementAuthSchema = z.object({
	managementPassword: PasswordSchema,
});
export type GroupManagementAuthInput = z.infer<
	typeof GroupManagementAuthSchema
>;

export const JoinGroupSchema = z.object({
	accessKey: z.string().min(6, "Invalid access key"), // Assuming accessKey is a short string
});
export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;

// --- Question Schemas ---
export const QuestionBaseSchema = z.object({
	title: z
		.string()
		.min(5, "Title too short")
		.max(200, "Title too long")
		.optional(),
	content: z
		.string()
		.min(10, "Question content is too short")
		.max(5000, "Question content is too long"),
	authorNickname: NicknameSchema,
	tags: TagsArraySchema.optional().default([]),
});

export const CreateQuestionSchema = QuestionBaseSchema.extend({
	groupId: MongoIdSchema,
	// Optional: if questions have individual management passwords
	// managementPassword: PasswordSchema.optional(),
});
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;

export const UpdateQuestionSchema = z.object({
	title: z.string().min(5).max(200).optional().nullable(),
	content: z.string().min(10).max(5000).optional(),
	tags: TagsArraySchema.optional(),
	// Optional: if questions have individual management passwords and need it for update
	// managementPassword: PasswordSchema.optional(),
});
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;

export const AcceptAnswerSchema = z.object({
	answerId: MongoIdSchema,
	// Optional: password for the question or group admin auth token
	// managementPassword: PasswordSchema.optional(),
});
export type AcceptAnswerInput = z.infer<typeof AcceptAnswerSchema>;

// --- Answer Schemas ---
export const AnswerBaseSchema = z.object({
	content: z
		.string()
		.min(5, "Answer is too short")
		.max(5000, "Answer is too long"),
	authorNickname: NicknameSchema,
});

export const CreateAnswerSchema = AnswerBaseSchema.extend({
	questionId: MongoIdSchema,
	// Optional: if answers have individual management passwords
	// managementPassword: PasswordSchema.optional(),
});
export type CreateAnswerInput = z.infer<typeof CreateAnswerSchema>;

export const UpdateAnswerSchema = z.object({
	content: z.string().min(5).max(5000).optional(),
	// Optional: if answers have individual management passwords and need it for update
	// managementPassword: PasswordSchema.optional(),
});
export type UpdateAnswerInput = z.infer<typeof UpdateAnswerSchema>;

export const VoteSchema = z.object({
	voteType: z.enum(["up", "down"]),
});
export type VoteInput = z.infer<typeof VoteSchema>;

// --- AI Schemas ---
export const SimilarQuestionsSchema = z.object({
	currentQuestionContent: z
		.string()
		.min(10, "Content too short for similarity check"),
	groupId: MongoIdSchema.optional(),
	currentQuestionId: MongoIdSchema.optional(),
});
export type SimilarQuestionsInput = z.infer<typeof SimilarQuestionsSchema>;

export const GenerateQuestionSchema = z.object({
	topic: z.string().min(3, "Topic too short").max(100, "Topic too long"),
	context: z.string().max(500, "Context too long").optional(),
	groupId: MongoIdSchema.optional(),
});
export type GenerateQuestionInput = z.infer<typeof GenerateQuestionSchema>;

export const GenerateAnswerSchema = z.object({
	questionContent: z.string().min(10, "Question content too short"),
	context: z.string().max(500, "Context too long").optional(),
	groupId: MongoIdSchema.optional(),
	questionId: MongoIdSchema,
});
export type GenerateAnswerInput = z.infer<typeof GenerateAnswerSchema>;

// --- Pagination Query Schema ---
export const PaginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional().default(1),
	limit: z.coerce.number().int().min(1).max(100).optional().default(10),
	sortBy: z.string().optional(), // Specific sort fields can be validated per endpoint
	sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type PaginationQueryInput = z.infer<typeof PaginationQuerySchema>;
