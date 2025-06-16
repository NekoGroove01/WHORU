import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import {
	NotFoundError,
	UnauthorizedError,
	withErrorHandler,
	withValidation,
} from "@/middleware/withMiddleware";
import z from "zod";

type RouteParams = {
	groupId: string;
};

const VerifyPasswordSchema = z.object({
	adminPassword: z.string().min(6),
});

// GET /api/groups/[groupId]/settings - Get full group info for admin
export const GET = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;

	// Validate groupId parameter
	if (!params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}

	// Check admin authorization token
	const adminToken = req.headers.get("x-admin-token");
	if (!adminToken) {
		throw new UnauthorizedError("Admin authorization required");
	}

	// Get group data
	const group = await GroupsCollection.findById(params.groupId);
	if (!group) {
		throw new NotFoundError("Group not found");
	}

	// Return full group info including accessKey
	return NextResponse.json({
		id: group._id,
		name: group.name,
		description: group.description,
		isPublic: group.isPublic,
		accessKey: group.accessKey, // Include accessKey for admin
		tags: group.tags,
		questionCount: group.questionCount,
		lastActivityAt: group.lastActivityAt,
		createdAt: group.createdAt,
		updatedAt: group.updatedAt,
	});
});

// POST /api/groups/[groupId]/settings - Verify admin password
export const POST = withValidation(VerifyPasswordSchema)(
	async (req, context) => {
		// Extract groupId from params
		const params = await context?.params;

		// Validate groupId parameter
		if (!params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const { adminPassword } = req.validatedData!;

		const isValid = await GroupsCollection.verifyAdminPassword(
			params.groupId,
			adminPassword
		);

		if (!isValid) {
			throw new UnauthorizedError("Invalid admin password");
		}

		return NextResponse.json({ success: true });
	}
);
