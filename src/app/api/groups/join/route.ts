// src/app/api/groups/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groupService } from "@/utils/services/groupService";
import {
	GroupJoinRequestSchema,
	ErrorResponseSchema
} from "@/utils/schema";
import { z, ZodError } from "zod";

// Placeholder for getting temporary identity from request
// This is crucial as we need to know *who* is trying to join.
async function getTemporaryIdFromRequest(
	req: NextRequest
): Promise<string | null> {
	// Example: const token = req.headers.get('Authorization')?.split(' ')[1];
	// If token, decode and get tempId.
	// This NEEDS to be implemented based on your /api/identity/{groupId} flow.
	// For now, let's assume a mock ID. In a real app, this MUST be secure.
	return req.headers.get("X-Temporary-Id") ?? "mock-joiner-temp-id"; // Replace with actual auth logic
}

export async function POST(req: NextRequest) {
	try {
		const userTempId = await getTemporaryIdFromRequest(req);
		if (!userTempId) {
			return NextResponse.json(
				{
					statusCode: 401,
					message: "Unauthorized: Missing temporary identity.",
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 401 }
			);
		}

		const body = await req.json();
		const validatedData = GroupJoinRequestSchema.parse(body);

		const group = await groupService.joinGroup(
			validatedData.accessCode,
			userTempId
		);

		if (!group) {
			return NextResponse.json(
				{
					statusCode: 403,
					message: "Invalid access code or group not found.",
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 403 } // 403 Forbidden or 404 Not Found are both reasonable depending on if you want to reveal existence
			);
		}

		// Successfully "joined"
		return NextResponse.json(group, {
			status: 200,
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return NextResponse.json(
				{
					statusCode: 400,
					message: "Validation failed: Invalid request body.",
					details: error.flatten(),
				} as z.infer<typeof ErrorResponseSchema>,
				{ status: 400 }
			);
		}
		console.error("Error joining group:", error);
		return NextResponse.json(
			{ statusCode: 500, message: "Internal server error" } as z.infer<
				typeof ErrorResponseSchema
			>,
			{ status: 500 }
		);
	}
}
