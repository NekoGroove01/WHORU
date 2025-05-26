import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import z from "zod";

type RouteParams = {
	params: { groupId: string };
};

const VerifyAccessSchema = z.object({
	accessKey: z.string(),
});

// POST /api/groups/verify-password/[groupId] - Verify access key
export const POST = withErrorHandler<RouteParams>(
	validateRequest(VerifyAccessSchema)(async (req, context) => {
		// Validate groupId parameter
		if (!context?.params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const { accessKey } = req.validatedData!;

		const isValid = await GroupsCollection.verifyAccessKey(
			context.params.groupId,
			accessKey
		);

		return NextResponse.json({ valid: isValid });
	})
);
