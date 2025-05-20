// src/app/api/groups/join/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/utils/mongodb";
import { JoinGroupSchema } from "@/utils/schemas";
import type { Group } from "@/types/group";
import type { DbGroup } from "@/types/schemas/group";

// Helper to map DB document to frontend Group type for this context
// When joining, we show basic group details, not the accessKey itself.
function mapDbGroupToJoinResult(dbGroup: DbGroup): Omit<Group, "accessKey"> {
	return {
		id: dbGroup._id.toHexString(),
		name: dbGroup.name,
		description: dbGroup.description ?? null,
		isPublic: dbGroup.isPublic, // Will be false in this context
		tags: dbGroup.tags ?? [],
		questionCount: dbGroup.questionCount,
		lastActivityAt: dbGroup.lastActivityAt.toISOString(),
		createdAt: dbGroup.createdAt.toISOString(),
		updatedAt: dbGroup.updatedAt.toISOString(),
	};
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validationResult = JoinGroupSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { accessKey } = validationResult.data;

		const { db } = await connectToDatabase();
		const group = await db
			.collection<DbGroup>("groups")
			.findOne({ accessKey: accessKey, isPublic: false }); // Ensure it's a private group's key

		if (!group) {
			return NextResponse.json(
				{ message: "Invalid or expired access key, or group is not private." },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ group: mapDbGroupToJoinResult(group) },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to join group:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
