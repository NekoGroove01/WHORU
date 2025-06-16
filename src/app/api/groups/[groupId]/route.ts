import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { UpdateGroupSchema } from "@/types/schemas/group";
import {
	NotFoundError,
	withErrorHandler,
	withValidation,
} from "@/middleware/withMiddleware";
import z from "zod";

type RouteParams = {
	groupId: string;
};

// GET /api/groups/[groupId] - Get specific group
export const GET = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;
	// Validate groupId parameter
	if (!params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}

	const group = await GroupsCollection.findById(params.groupId);

	if (!group) {
		throw new NotFoundError("Group not found");
	}

	// Check access if private
	if (!group.isPublic) {
		console.log("Group is private, checking access key");
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
export const PUT = withValidation(UpdateGroupSchema)(async (req, context) => {
	const { adminPassword, ...updateData } = req.validatedData!;

	const { groupId } = (await context?.params) || {};
	// Validate adminPassword
	// Validate groupId parameter
	if (!groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}

	const group = await GroupsCollection.update(
		groupId,
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
});

// DELETE /api/groups/[groupId] - Delete group
const DeleteSchema = z.object({
	adminPassword: z.string().min(6),
});

export const DELETE = withValidation(DeleteSchema)(async (req, context) => {
	// Validate groupId parameter
	const params = await context?.params;
	if (!params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}
	const { adminPassword } = req.validatedData!;

	const deleted = await GroupsCollection.delete(params.groupId, adminPassword);

	if (!deleted) {
		throw new NotFoundError("Group not found");
	}

	return NextResponse.json({ success: true });
});
