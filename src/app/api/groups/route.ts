import { NextRequest, NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { CreateGroupSchema } from "@/types/schemas/group";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";

// GET /api/groups - Get public groups
export const GET = withErrorHandler(async (req: NextRequest) => {
	const { searchParams } = new URL(req.url);
	const page = parseInt(searchParams.get("page") || "1");
	const limit = parseInt(searchParams.get("limit") || "20");
	const skip = (page - 1) * limit;

	const { groups, total } = await GroupsCollection.findPublicGroups(
		skip,
		limit
	);

	// Transform groups to remove sensitive data
	const publicGroups = groups.map((group) => ({
		id: group._id,
		name: group.name,
		description: group.description,
		tags: group.tags,
		questionCount: group.questionCount,
		lastActivityAt: group.lastActivityAt,
		createdAt: group.createdAt,
	}));

	return NextResponse.json({
		groups: publicGroups,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	});
});

// POST /api/groups - Create new group
export const POST = withErrorHandler(
	validateRequest(CreateGroupSchema)(async (req) => {
		const data = req.validatedData!;

		const group = await GroupsCollection.create(data);

		// Return group without sensitive data
		return NextResponse.json({
			id: group._id,
			name: group.name,
			description: group.description,
			isPublic: group.isPublic,
			accessKey: group.accessKey,
			tags: group.tags,
			questionCount: group.questionCount,
			lastActivityAt: group.lastActivityAt,
			createdAt: group.createdAt,
		});
	})
);
