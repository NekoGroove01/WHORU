// src/app/api/groups/route.ts
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { connectToDatabase } from "@/utils/mongodb";
import { CreateGroupSchema, PaginationQuerySchema } from "@/utils/schemas";
import type { Group } from "@/types/group";
import type { DbGroup } from "@/types/schemas/group";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "16", 16);

// Helper to map DB document to frontend Group type
// For list view, accessKey for private groups should not be exposed
function mapDbGroupToGroupListItem(dbGroup: DbGroup): Omit<Group, "accessKey"> {
	return {
		id: dbGroup._id.toHexString(),
		name: dbGroup.name,
		description: dbGroup.description ?? null,
		isPublic: dbGroup.isPublic,
		tags: dbGroup?.tags ?? [],
		questionCount: dbGroup.questionCount,
		lastActivityAt: dbGroup.lastActivityAt.toISOString(),
		createdAt: dbGroup.createdAt.toISOString(),
		updatedAt: dbGroup.updatedAt.toISOString(),
	};
}

function mapDbGroupToGroupDetail(dbGroup: DbGroup): Group {
	return {
		id: dbGroup._id.toHexString(),
		name: dbGroup.name,
		description: dbGroup.description ?? null,
		isPublic: dbGroup.isPublic,
		// Only include accessKey if the group is private; public groups don't need/use it in this context
		accessKey: dbGroup.isPublic ? undefined : dbGroup.accessKey,
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
		const validationResult = CreateGroupSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid input",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const { name, description, isPublic, managementPassword, tags } =
			validationResult.data;

		const { db } = await connectToDatabase();

		const managementPasswordHash = await bcrypt.hash(
			managementPassword,
			BCRYPT_SALT_ROUNDS
		);

		const now = new Date();
		const newGroup: Omit<DbGroup, "_id"> = {
			name,
			description: description ?? undefined, // Store as undefined if null/empty
			isPublic: isPublic ?? true,
			accessKey: isPublic ? undefined : nanoid(8), // Generate accessKey only for private groups
			managementPasswordHash,
			tags: tags ?? [],
			questionCount: 0,
			lastActivityAt: now,
			createdAt: now,
			updatedAt: now,
		};

		const result = await db
			.collection<Omit<DbGroup, "_id">>("groups")
			.insertOne(newGroup);

		if (!result.insertedId) {
			return NextResponse.json(
				{ message: "Failed to create group" },
				{ status: 500 }
			);
		}

		const createdGroup = {
			_id: result.insertedId,
			...newGroup,
		} as DbGroup;

		return NextResponse.json(
			{ group: mapDbGroupToGroupDetail(createdGroup) },
			{ status: 201 }
		);
	} catch (error) {
		console.error("Failed to create group:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = request.nextUrl;
		const queryParams = Object.fromEntries(searchParams.entries());
		const validationResult = PaginationQuerySchema.safeParse(queryParams);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Invalid query parameters",
					errors: validationResult.error.flatten().fieldErrors,
				},
				{ status: 400 }
			);
		}

		const {
			page,
			limit,
			sortBy = "lastActivityAt",
			sortOrder = "desc",
		} = validationResult.data;

		const { db } = await connectToDatabase();
		const skip = (page - 1) * limit;

		const sortOptions: { [key: string]: 1 | -1 } = {};
		if (sortBy) {
			sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
		}

		const groupsCollection = db.collection<DbGroup>("groups");
		const totalGroups = await groupsCollection.countDocuments({
			isPublic: true,
		});
		const dbGroups = await groupsCollection
			.find({ isPublic: true })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.toArray();

		const groups = dbGroups.map(mapDbGroupToGroupListItem);

		return NextResponse.json(
			{
				groups,
				totalPages: Math.ceil(totalGroups / limit),
				currentPage: page,
				totalGroups,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Failed to fetch groups:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
