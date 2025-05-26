import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { UpdateGroupSchema } from "@/types/schemas/group";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, NotFoundError } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { groupId: string };
};

// GET /api/groups/[groupId] - Get specific group
export const GET = withErrorHandler<RouteParams>(async (req, context) => {
	// Validate groupId parameter
	if (!context?.params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}

	const group = await GroupsCollection.findById(context?.params?.groupId);

	if (!group) {
		throw new NotFoundError("Group not found");
	}

	// Check access if private
	if (!group.isPublic) {
		const accessKey = req.headers.get("x-access-key");
		if (!accessKey || group.accessKey !== accessKey) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}
	}

	return NextResponse.json({
		id: group._id,
		name: group.name,
		description: group.description,
		isPublic: group.isPublic,
		tags: group.tags,
		questionCount: group.questionCount,
		lastActivityAt: group.lastActivityAt,
		createdAt: group.createdAt,
		updatedAt: group.updatedAt,
	});
});

// PUT /api/groups/[groupId] - Update group
export const PUT = withErrorHandler<RouteParams>(
	validateRequest(UpdateGroupSchema)(async (req, context) => {
		const { adminPassword, ...updateData } = req.validatedData!;

		// Validate groupId parameter
		if (!context?.params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const group = await GroupsCollection.update(
			context?.params?.groupId,
			updateData,
			adminPassword
		);

		if (!group) {
			throw new NotFoundError("Group not found");
		}

		return NextResponse.json({
			id: group._id,
			name: group.name,
			description: group.description,
			isPublic: group.isPublic,
			tags: group.tags,
			updatedAt: group.updatedAt,
		});
	})
);

// DELETE /api/groups/[groupId] - Delete group
const DeleteSchema = z.object({
	adminPassword: z.string().min(6),
});

export const DELETE = withErrorHandler<RouteParams>(
	validateRequest(DeleteSchema)(async (req, context) => {
		// Validate groupId parameter
		if (!context?.params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}
		const { adminPassword } = req.validatedData!;

		const deleted = await GroupsCollection.delete(
			context?.params?.groupId,
			adminPassword
		);

		if (!deleted) {
			throw new NotFoundError("Group not found");
		}

		return NextResponse.json({ success: true });
	})
);
