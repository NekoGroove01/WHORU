// src/app/api/groups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groupService } from "@/utils/services/groupService";
import {
	GroupCreateSchema,
	GetPublicGroupsQuerySchema,
	ErrorResponseSchema,
} from "@/utils/schema";
import { z, ZodError } from "zod";

// Placeholder for getting temporary identity from request (e.g., from a JWT middleware)
// In a real app, this would be populated by an authentication middleware.
async function getTemporaryIdFromRequest(
	req: NextRequest
): Promise<string | null> {
	// Example: const token = req.headers.get('Authorization')?.split(' ')[1];
	// If token, decode and get tempId. For now, returning a mock or null.
	// For POST, we need a creatorId. Let's assume it's 'mock-creator-temp-id' for now.
	// This part needs to be implemented with your actual TempIdentity auth flow.
	if (req.method === "POST") {
		return "mock-creator-temp-id"; // Replace with actual logic
	}
	return null;
}

export async function POST(req: NextRequest) {
	try {
		const creatorTempId = await getTemporaryIdFromRequest(req);
		if (!creatorTempId) {
			// This should ideally be handled by an auth middleware before reaching here
			return NextResponse.json(
				{
					statusCode: 401,
					message: "Unauthorized: Missing temporary identity for creator.",
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 401 }
			);
		}

		const body = await req.json();
		const validatedData = GroupCreateSchema.parse(body);

		const newGroup = await groupService.createGroup(
			validatedData,
			creatorTempId
		);

		return NextResponse.json(newGroup, { status: 201 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					statusCode: 400,
					message: "Validation failed",
					details: error.flatten(),
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 400 }
			);
		}
		console.error("Error creating group:", error);
		return NextResponse.json(
			{ statusCode: 500, message: "Internal server error" } as z.infer<
				typeof ErrorResponseSchema
			>,
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const queryParams = Object.fromEntries(searchParams.entries());

		// Validate query parameters
		const validatedQuery = GetPublicGroupsQuerySchema.parse(queryParams);

		const paginatedGroups = await groupService.getPublicGroups(validatedQuery);

		return NextResponse.json(paginatedGroups, { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					statusCode: 400,
					message: "Invalid query parameters",
					details: error.flatten(),
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 400 }
			);
		}
		console.error("Error fetching public groups:", error);
		return NextResponse.json(
			{ statusCode: 500, message: "Internal server error" } as z.infer<
				typeof ErrorResponseSchema
			>,
			{ status: 500 }
		);
	}
}
