// src/app/api/groups/[groupId]/settings/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import {
	UpdateGroupSchema,
	GroupManagementAuthSchema,
	MongoIdSchema,
} from "@/utils/schemas";
import type { Group } from "@/types/group";
import type { DbGroup } from "@/types/schemas/group";

// Re-using the detail mapper
function mapDbGroupToGroupDetail(dbGroup: DbGroup): Group {
	return {
		id: dbGroup._id.toHexString(),
		name: dbGroup.name,
		description: dbGroup.description ?? null,
		isPublic: dbGroup.isPublic,
		accessKey: dbGroup.isPublic ? undefined : dbGroup.accessKey,
		tags: dbGroup.tags ?? [],
		questionCount: dbGroup.questionCount,
		lastActivityAt: dbGroup.lastActivityAt.toISOString(),
		createdAt: dbGroup.createdAt.toISOString(),
		updatedAt: dbGroup.updatedAt.toISOString(),
	};
}

export async function PUT(
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
		// The body should contain managementPassword and the fields to update
		const { managementPassword, ...updateData } = body;

		const authValidation = GroupManagementAuthSchema.safeParse({
			managementPassword,
		});
		if (!authValidation.success) {
			return NextResponse.json(
				{
					message: "Management password is required and must be valid",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const updateValidation = UpdateGroupSchema.safeParse(updateData);
		if (!updateValidation.success) {
			return NextResponse.json(
				{
					message: "Invalid update data",
					errors: updateValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

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

		const finalUpdateData = { ...updateValidation.data };
		// Ensure null descriptions are stored as undefined or handled by DB schema
		if (finalUpdateData.description === null) {
			finalUpdateData.description = undefined;
		}

		const updateDoc = {
			$set: {
				...finalUpdateData,
				updatedAt: new Date(),
			},
		};

		const result = await groupsCollection.updateOne({ _id: validGroupId }, [
			updateDoc,
		]);

		if (result.matchedCount === 0) {
			return NextResponse.json(
				{ message: "Group not found for update" },
				{ status: 404 }
			);
		}
		if (result.modifiedCount === 0 && result.matchedCount === 1) {
			return NextResponse.json(
				{
					message: "No changes applied",
					group: mapDbGroupToGroupDetail(group),
				},
				{ status: 200 }
			);
		}

		const updatedGroup = await groupsCollection.findOne({ _id: validGroupId });
		if (!updatedGroup) {
			// Should not happen if update was successful
			return NextResponse.json(
				{ message: "Failed to retrieve updated group" },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ group: mapDbGroupToGroupDetail(updatedGroup) },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to update group settings:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
