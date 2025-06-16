import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import {
	NotFoundError,
	withValidation,
} from "@/middleware/withMiddleware";
import z from "zod";

const JoinGroupSchema = z.object({
	accessKey: z.string(),
});

// POST /api/groups/join - Join private group
export const POST = withValidation(JoinGroupSchema)(async (req) => {
	const { accessKey } = req.validatedData!;

	// Find group by access key
	const group = await GroupsCollection.findByAccessKey(accessKey);

	if (!group) {
		throw new NotFoundError("Invalid access key");
	}

	return NextResponse.json({
		id: group._id,
		name: group.name,
		description: group.description,
		tags: group.tags,
	});
});
