import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler, NotFoundError } from "@/middleware/errorHandler";
import z from "zod";

const JoinGroupSchema = z.object({
	accessKey: z.string(),
});

// POST /api/groups/join - Join private group
export const POST = withErrorHandler(
	validateRequest(JoinGroupSchema)(async (req) => {
		const { accessKey } = req.validatedData!;

		// Find group by access key
		const groups = await GroupsCollection.findPublicGroups(0, 1000);
		const group = groups.groups.find((g) => g.accessKey === accessKey);

		if (!group) {
			throw new NotFoundError("Invalid access key");
		}

		return NextResponse.json({
			id: group._id,
			name: group.name,
			description: group.description,
			tags: group.tags,
		});
	})
);
