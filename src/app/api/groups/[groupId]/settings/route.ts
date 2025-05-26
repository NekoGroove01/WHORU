import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, UnauthorizedError } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { groupId: string };
};

const VerifyPasswordSchema = z.object({
	adminPassword: z.string().min(6),
});

// POST /api/groups/[groupId]/settings - Verify admin password
export const POST = withErrorHandler<RouteParams>(
	validateRequest(VerifyPasswordSchema)(async (req, context) => {
		// Validate groupId parameter
		if (!context?.params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const { adminPassword } = req.validatedData!;

		const isValid = await GroupsCollection.verifyAdminPassword(
			context.params.groupId,
			adminPassword
		);

		if (!isValid) {
			throw new UnauthorizedError("Invalid admin password");
		}

		return NextResponse.json({ success: true });
	})
);
