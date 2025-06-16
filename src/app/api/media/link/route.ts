import { NextResponse } from "next/server";
import { withValidation } from "@/middleware/withMiddleware";
import z from "zod";

const LinkMediaSchema = z.object({
	mediaIds: z.array(z.string()),
	contentType: z.enum(["question", "answer"]),
	contentId: z.string(),
});

// POST /api/media/link - Link media to content
export const POST = withValidation(LinkMediaSchema)(async (req) => {
	const { mediaIds, contentType, contentId } = req.validatedData!;

	const { MediaCollection } = await import("@/lib/db/collections/media");

	await Promise.all(
		mediaIds.map((mediaId) =>
			MediaCollection.associateWithContent(mediaId, contentType, contentId)
		)
	);

	return NextResponse.json({ success: true });
});
