// src/services/groupService.ts
import {
	GroupCreateSchema,
	GroupSchema,
	GetPublicGroupsQuerySchema,
	PaginatedPublicGroupsResponseSchema,
	GroupSettingsSchema,
	GroupJoinRequestSchema, // For default settings
} from "@/utils/schema";
import {
	groupRepository,
	GroupInsertData,
} from "@/utils/repositories/groupRepository"; // Assuming this is the correct path
import { z } from "zod";
import { nanoid } from "nanoid"; // For generating IDs and access codes

const DEFAULT_GROUP_SETTINGS: z.infer<typeof GroupSettingsSchema> = {
	allowVotingOnQuestions: true,
	allowVotingOnAnswers: true,
	allowAnonymousQuestions: true,
	allowAnonymousAnswers: true,
	allowTagging: true,
	allowPolls: true,
	allowMediaUploads: true,
	moderationEnabled: false,
	aiAnswerGenerationEnabled: true,
	similarQuestionSuggestionsEnabled: true,
};

export class GroupService {
	async createGroup(
		data: z.infer<typeof GroupCreateSchema>,
		creatorTempId: string // Assuming this comes from authenticated context
	): Promise<z.infer<typeof GroupSchema>> {
		const now = new Date();
		const groupId = nanoid(); // Generate unique ID for the group

		let accessCode: string | null = null;
		if (!data.isPublic) {
			accessCode = nanoid(8); // Shorter, unique code for private groups
		}

		let expiresAt: Date | null = null;
		if (
			data.expiresAfterDays !== undefined &&
			data.expiresAfterDays !== null &&
			data.expiresAfterDays > 0
		) {
			expiresAt = new Date(
				now.getTime() + data.expiresAfterDays * 24 * 60 * 60 * 1000
			);
		}

		const groupToCreate: GroupInsertData = {
			id: groupId,
			name: data.name,
			description: data.description ?? null,
			isPublic: data.isPublic ?? true,
			accessCode: accessCode,
			qrCodeLink: null, // Can be generated on demand: e.g., /join?code={accessCode} or /group/{groupId}
			createdAt: now,
			updatedAt: now,
			expiresAt: expiresAt,
			settings: {
				...DEFAULT_GROUP_SETTINGS,
				...(data.settings ?? {}),
			},
			lastActivityAt: now,
			creatorTempId: creatorTempId, // Store who created it
			memberCount: 0, // Initial count
			questionCount: 0, // Initial count
		};

		const createdGroup = await groupRepository.create(groupToCreate);

		// The repository already maps to GroupSchema (with string dates)
		return createdGroup;
	}

	async getPublicGroups(
		query: z.infer<typeof GetPublicGroupsQuerySchema>
	): Promise<z.infer<typeof PaginatedPublicGroupsResponseSchema>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 20;
		const sortBy = query.sortBy ?? "lastActivityAt";
		const sortOrder = query.sortOrder ?? "desc";

		const groups = await groupRepository.findAllPublic(
			page,
			limit,
			sortBy,
			sortOrder
		);
		const total = await groupRepository.countAllPublic();

		return {
			total,
			page,
			limit,
			groups,
		};
	}

	async getGroupById(id: string): Promise<z.infer<typeof GroupSchema> | null> {
		// Later, this service method might check permissions for private groups
		return groupRepository.findById(id);
	}

	async joinGroup(
		accessCode: string,
		userTempId: string // The temporary ID of the user trying to join
	): Promise<z.infer<typeof GroupSchema> | null> {
		const group = await groupRepository.findByAccessCode(accessCode);

		if (!group) {
			return null; // Group not found with this access code
		}

		// At this point, the user has successfully "joined" by providing the correct code.
		// Future enhancements:
		// - Log this join event.
		// - If groups have explicit member lists: groupRepository.addMember(group.id, userTempId);
		// - Update group.memberCount if actively tracking distinct joiners (more complex).

		// For now, successfully finding the group by access code is sufficient to grant access.
		// The group object returned already includes necessary details thanks to mapDocumentToGroupSchema.
		return group;
	}
}

export const groupService = new GroupService();
