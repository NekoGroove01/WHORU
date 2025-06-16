import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { withValidation } from "@/middleware/withMiddleware";
import z from "zod";


const VerifyAccessSchema = z.object({
	accessKey: z.string(),
});

// POST /api/groups/verify-password/[groupId] - Verify access key
export const POST = withValidation(VerifyAccessSchema)(async (req, context) => {
	const params = await context?.params;
	// Validate groupId parameter
	if (!params?.groupId) {
		return NextResponse.json(
			{ error: "Group ID is required" },
			{ status: 400 }
		);
	}

	const { accessKey } = req.validatedData!;

	const isValid = await GroupsCollection.verifyAccessKey(
		params.groupId,
		accessKey
	);

	return NextResponse.json({ valid: isValid });
});
