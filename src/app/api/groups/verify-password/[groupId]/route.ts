// src/app/api/groups/[groupId]/verify-password/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/utils/mongodb";
import { GroupManagementAuthSchema, MongoIdSchema } from "@/utils/schemas";
import type { DbGroup } from "@/types/schemas/group";

export async function POST(
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
					message: "Management password is required",
					errors: authValidation.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}
		const { managementPassword } = authValidation.data;

		const { db } = await connectToDatabase();
		const group = await db
			.collection<DbGroup>("groups")
			.findOne(
				{ _id: validGroupId },
				{ projection: { managementPasswordHash: 1 } }
			);

		if (!group) {
			return NextResponse.json({ message: "Group not found" }, { status: 404 });
		}

		const isPasswordValid = await bcrypt.compare(
			managementPassword,
			group.managementPasswordHash
		);

		if (!isPasswordValid) {
			// It's often better not to reveal if it's the ID or password that's wrong for non-existent users
			// but since this is for an existing group context, this is okay.
			return NextResponse.json(
				{ authorized: false, message: "Invalid management password" },
				{ status: 401 }
			);
		}

		// In a real app, you might issue a short-lived JWT here for subsequent authenticated requests.
		return NextResponse.json({ authorized: true }, { status: 200 });
	} catch (error) {
		console.error("Failed to verify group password:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
