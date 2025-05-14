// src/utils/schemas.ts
import { z } from "zod";

// Reusable ID schema - assuming nanoid generates non-empty strings
export const nanoidSchema = z.string().min(1); // General purpose for nanoid IDs

// --------------------
// Media Schemas
// --------------------
export const MediaAttachmentSchema = z.object({
	mediaId: nanoidSchema,
	url: z.string().url(),
	thumbnailUrl: z.string().url().nullable().optional(),
	fileName: z.string(),
	mimeType: z.string(),
	fileSize: z.number().int(),
	displayOrder: z.number().int().nullable().optional(),
});

export const MediaUploadRequestSchema = z.object({
	fileName: z.string(),
	fileType: z.string(), // MIME type
	fileSize: z.number().int(),
	groupId: nanoidSchema,
});

// Response schema, useful for client-side type checking
export const MediaUploadResponseSchema = z.object({
	uploadUrl: z.string().url(),
	mediaId: nanoidSchema,
});

export const MediaSchema = z.object({
	id: nanoidSchema,
	groupId: nanoidSchema,
	uploaderId: z.string(), // temp identity authorId
	url: z.string().url(),
	thumbnailUrl: z.string().url().nullable().optional(),
	fileName: z.string(),
	mimeType: z.string(),
	fileSize: z.number().int(),
	createdAt: z.string().datetime(),
});

// --------------------
// Poll Schemas
// --------------------
export const PollOptionSchema = z.object({
	id: z.number().int(), // Index of the option (0-based)
	text: z.string(),
	voteCount: z.number().int().default(0),
});

export const PollCreateSchema = z.object({
	options: z.array(z.string().min(1).max(100)).min(2).max(10),
	allowMultipleVotes: z.boolean().default(false).optional(),
	durationDays: z.number().int().min(0).nullable().optional(),
});

export const PollUpdateSchema = z.object({
	// Per OpenAPI: "Currently, polls cannot be structurally updated after creation, only closed."
	status: z.enum(["open", "closed"]).optional(),
});

export const PollSchema = z.object({
	options: z.array(PollOptionSchema),
	allowMultipleVotes: z.boolean().default(false),
	totalVotes: z.number().int().default(0),
	userVotedOptions: z.array(z.number().int()).nullable().optional(), // Array of option indices
	closesAt: z.string().datetime().nullable().optional(),
});

// --------------------
// Group Schemas
// --------------------
export const GroupSettingsUpdateSchema = z.object({
	allowVotingOnQuestions: z.boolean().nullable().optional(),
	allowVotingOnAnswers: z.boolean().nullable().optional(),
	allowAnonymousQuestions: z.boolean().nullable().optional(),
	allowAnonymousAnswers: z.boolean().nullable().optional(),
	allowTagging: z.boolean().nullable().optional(),
	allowPolls: z.boolean().nullable().optional(),
	allowMediaUploads: z.boolean().nullable().optional(),
	moderationEnabled: z.boolean().nullable().optional(),
	aiAnswerGenerationEnabled: z.boolean().nullable().optional(),
	similarQuestionSuggestionsEnabled: z.boolean().nullable().optional(),
});

export const GroupSettingsSchema = z.object({
	allowVotingOnQuestions: z.boolean().default(true),
	allowVotingOnAnswers: z.boolean().default(true),
	allowAnonymousQuestions: z.boolean().default(true),
	allowAnonymousAnswers: z.boolean().default(true),
	allowTagging: z.boolean().default(true),
	allowPolls: z.boolean().default(true),
	allowMediaUploads: z.boolean().default(true),
	moderationEnabled: z.boolean().default(false),
	aiAnswerGenerationEnabled: z.boolean().default(true),
	similarQuestionSuggestionsEnabled: z.boolean().default(true),
});

export const GroupCreateSchema = z.object({
	name: z.string().min(3).max(100),
	description: z.string().max(500).nullable().optional(),
	isPublic: z.boolean().default(true).optional(),
	settings: GroupSettingsUpdateSchema.optional(),
	expiresAfterDays: z.number().int().min(0).nullable().optional(),
});

export const GroupUpdateSchema = z.object({
	name: z.string().min(3).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
	isPublic: z.boolean().optional(),
	settings: GroupSettingsUpdateSchema.optional(),
	expiresAfterDays: z.number().int().min(0).nullable().optional(),
});

export const GroupSchema = z.object({
	id: nanoidSchema,
	name: z.string(),
	description: z.string().nullable(),
	isPublic: z.boolean(),
	accessCode: z.string().nullable().optional(), // Conditionally present
	qrCodeLink: z.string().url().nullable().optional(), // Conditionally present
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	expiresAt: z.string().datetime().nullable(),
	settings: GroupSettingsSchema,
	tags: z.array(z.string()).optional(), // Derived, might not be present
	memberCount: z.number().int().optional(), // Derived, might not be present
	questionCount: z.number().int().optional(), // Derived, might not be present
	lastActivityAt: z.string().datetime().nullable(),
});

// --------------------
// Question Schemas
// --------------------
const questionStatusSchema = z.enum(["open", "answered", "closed"]);

export const QuestionCreateSchema = z.object({
	title: z.string().min(5).max(200),
	content: z.string().min(10).max(5000),
	tags: z
		.array(z.string().regex(/^[a-zA-Z0-9-]{1,30}$/))
		.max(10)
		.nullable()
		.optional(),
	mediaIds: z.array(nanoidSchema).max(5).nullable().optional(),
	poll: PollCreateSchema.optional(),
	isAnonymousOverride: z.boolean().nullable().optional(),
});

export const QuestionUpdateSchema = z.object({
	title: z.string().min(5).max(200).optional(),
	content: z.string().min(10).max(5000).optional(),
	tags: z
		.array(z.string().regex(/^[a-zA-Z0-9-]{1,30}$/))
		.max(10)
		.nullable()
		.optional(),
	status: z.enum(["open", "closed"]).optional(), // User can only set to 'open' or 'closed'
	mediaIds: z.array(nanoidSchema).max(5).nullable().optional(),
	poll: PollUpdateSchema.optional(), // For closing the poll
});

export const QuestionSchema = z.object({
	id: nanoidSchema,
	groupId: nanoidSchema,
	title: z.string(),
	content: z.string(),
	tags: z.array(z.string()),
	status: questionStatusSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	lastActivityAt: z.string().datetime(),
	authorId: z.string(),
	tempNickname: z.string(),
	isAnonymous: z.boolean(),
	upvotes: z.number().int().default(0),
	downvotes: z.number().int().default(0),
	views: z.number().int().default(0),
	answerCount: z.number().int().default(0),
	mediaAttachments: z.array(MediaAttachmentSchema).optional(), // Present if media exists
	poll: PollSchema.optional(), // Present if poll exists
	aiSuggested: z.boolean().default(false),
	userVote: z.enum(["up", "down", "none"]).nullable().optional(), // Depends on user context
});

// --------------------
// Answer Schemas
// --------------------
export const AnswerCreateSchema = z.object({
	content: z.string().min(10).max(10000),
	mediaIds: z.array(nanoidSchema).max(5).nullable().optional(),
	isAIGenerated: z.boolean().default(false).optional(),
	isAnonymousOverride: z.boolean().nullable().optional(),
});

export const AnswerUpdateSchema = z.object({
	content: z.string().min(10).max(10000).optional(),
	mediaIds: z.array(nanoidSchema).max(5).nullable().optional(),
});

export const AnswerSchema = z.object({
	id: nanoidSchema,
	questionId: nanoidSchema,
	content: z.string(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	authorId: z.string(),
	tempNickname: z.string(),
	isAnonymous: z.boolean(),
	upvotes: z.number().int().default(0),
	downvotes: z.number().int().default(0),
	mediaAttachments: z.array(MediaAttachmentSchema).optional(), // Present if media exists
	isAccepted: z.boolean().default(false),
	isAIGenerated: z.boolean().default(false),
	userVote: z.enum(["up", "down", "none"]).nullable().optional(), // Depends on user context
});

// --------------------
// Temporary Identity Schemas
// --------------------
export const TemporaryIdentityRequestSchema = z
	.object({
		nickname: z
			.string()
			.min(3)
			.max(30)
			.regex(/^[a-zA-Z0-9_-]+$/)
			.nullable()
			.optional(),
		password: z.string().min(6).nullable().optional(),
	})
	.refine(
		(data) => {
			// Password should only be provided if a nickname is also provided.
			return !(data.password && !data.nickname);
		},
		{
			message: "Password cannot be provided without a nickname.",
			path: ["password"], // Or common path if preferred
		}
	);

// Response schema, useful for client-side type checking
export const TemporaryIdentityResponseSchema = z.object({
	groupId: nanoidSchema,
	authorId: z.string(), // This is the TempID itself for this session
	nickname: z.string(),
	isAnonymous: z.boolean(),
	token: z.string(), // JWT for Bearer authentication
	createdAt: z.string().datetime(),
	expiresAt: z.string().datetime(),
});

// --------------------
// Tag Schemas
// --------------------
export const TagSchema = z.object({
	name: z.string(),
	questionCount: z.number().int(),
});

// --------------------
// Vote Schemas
// --------------------
export const VoteRequestSchema = z.object({
	voteType: z.enum(["up", "down", "none"]),
});

// --------------------
// API General Schemas
// --------------------
export const ErrorResponseSchema = z.object({
	statusCode: z.number().int(),
	message: z.string(),
	errorCode: z.string().nullable().optional(),
	details: z.record(z.any()).nullable().optional(), // For field-specific validation errors etc.
});

// Pagination related schemas (example for listing public groups)
export const PaginatedPublicGroupsResponseSchema = z.object({
	total: z.number().int(),
	page: z.number().int(),
	limit: z.number().int(),
	groups: z.array(GroupSchema), // Assuming GroupSchema is what's returned for public listings
});

export const PaginatedGroupQuestionsResponseSchema = z.object({
	total: z.number().int(),
	page: z.number().int(),
	limit: z.number().int(),
	questions: z.array(QuestionSchema),
});

// --- AI Related Schemas ---
export const AIGeneratedAnswerSuggestionSchema = z.object({
	questionId: nanoidSchema,
	suggestedContent: z.string(),
	isAIGenerated: z.boolean().default(true),
});

export const SimilarQuestionsResponseSchema = z.array(QuestionSchema);

// --- Group Join Schema ---
export const GroupJoinRequestSchema = z.object({
	accessCode: z.string(),
});
// Response for join would be GroupSchema

// --- API Query Parameter Schemas (examples) ---
// These are useful if you validate query params using Zod in your API routes

export const GetPublicGroupsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
	sortBy: z
		.enum(["createdAt", "memberCount", "name", "lastActivity"])
		.default("lastActivity")
		.optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const GetGroupQuestionsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
	tag: z.string().optional(),
	sortBy: z
		.enum(["createdAt", "upvotes", "answerCount", "lastActivity"])
		.default("lastActivity")
		.optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
	status: z.enum(["open", "answered", "closed"]).optional(),
});

export const GetQuestionAnswersQuerySchema = z.object({
	sortBy: z.enum(["createdAt", "upvotes"]).default("upvotes").optional(),
	sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

export const GetSimilarQuestionsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(10).default(5).optional(),
});
