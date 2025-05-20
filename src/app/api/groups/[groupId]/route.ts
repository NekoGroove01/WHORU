// src/app/api/groups/[groupId]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import { GroupManagementAuthSchema, MongoIdSchema } from "@/utils/schemas";
import type { Group } from "@/types/group";
import type { DbGroup } from "@/types/schemas/group";

// Helper to map DB document to frontend Group type
// For detail view, accessKey for private groups might be exposed (e.g. to admin)
function mapDbGroupToGroupDetail(dbGroup: DbGroup): Group {
	return {
		id: dbGroup._id.toHexString(),
		name: dbGroup.name,
		description: dbGroup.description ?? null,
		isPublic: dbGroup.isPublic,
		// Only include accessKey if the group is private.
		// Public groups don't use it for joining.
		// The creator/admin would need to know this for sharing.
		accessKey: dbGroup.isPublic ? undefined : dbGroup.accessKey,
		tags: dbGroup.tags ?? [],
		questionCount: dbGroup.questionCount,
		lastActivityAt: dbGroup.lastActivityAt.toISOString(),
		createdAt: dbGroup.createdAt.toISOString(),
		updatedAt: dbGroup.updatedAt.toISOString(),
	};
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { groupId: string } }
) {
	try {
		const groupIdValidation = MongoIdSchema.safeParse(params.groupId);
		if (!groupIdValidation.success) {
			return NextResponse.json(
				{ message: "Invalid group ID format" },
				{ status: 400 }
			);
		}
		const groupId = new ObjectId(groupIdValidation.data);

		const { db } = await connectToDatabase();
		const group = await db
			.collection<DbGroup>("groups")
			.findOne({ _id: groupId });

		if (!group) {
			return NextResponse.json({ message: "Group not found" }, { status: 404 });
		}

		// If group is private, we might not want to return all details
		// without some form of auth. For now, returning basic public view.
		// If it's a direct fetch by ID, user might know it exists.
		// The `accessKey` is handled by the mapper.
		return NextResponse.json(
			{ group: mapDbGroupToGroupDetail(group) },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to fetch group:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { groupId: string } }
) {
	try {
		const groupIdValidation = MongoIdSchema.safeParse(params.groupId);
		if (!groupIdValidation.success) {
			return NextResponse.json(
				{ message: "Invalid group ID format" },
				{ status: 400 }
			);
		}
		const validGroupId = new ObjectId(groupIdValidation.data);

		const body = await request.json();
		const authValidation = GroupManagementAuthSchema.safeParse(body);

		if (!authValidation.success) {
			return NextResponse.json(
				{
					message: "Invalid input for deletion",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}
		const { managementPassword } = authValidation.data;

		const { db } = await connectToDatabase();
		const groupsCollection = db.collection<DbGroup>("groups");
		const group = await groupsCollection.findOne({ _id: validGroupId });

		if (!group) {
			return NextResponse.json({ message: "Group not found" }, { status: 404 });
		}

		const isPasswordValid = await bcrypt.compare(
			managementPassword,
			group.managementPasswordHash
		);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ message: "Invalid management password" },
				{ status: 403 }
			);
		}

		// Transaction recommended here in production for atomicity
		// For simplicity, performing sequential deletes:
		await db.collection("answers").deleteMany({ groupId: validGroupId });
		await db.collection("questions").deleteMany({ groupId: validGroupId });
		const deleteResult = await groupsCollection.deleteOne({
			_id: validGroupId,
		});

		if (deleteResult.deletedCount === 0) {
			// Should not happen if group was found and password was valid
			return NextResponse.json(
				{
					message:
						"Failed to delete group, group might have been deleted already",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: "Group and associated content deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to delete group:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
