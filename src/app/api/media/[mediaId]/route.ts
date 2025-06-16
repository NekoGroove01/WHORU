import { NextResponse } from "next/server";
import { MediaCollection } from "@/lib/db/collections/media";
import {
	S3Client,
	GetObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NotFoundError, withErrorHandler } from "@/middleware/withMiddleware";

type RouteParams = {
	mediaId: string;
};

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

// GET /api/media/[mediaId] - Get media download URL
export const GET = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;
	// Validate mediaId parameter
	if (!params?.mediaId) {
		return NextResponse.json(
			{ error: "Media ID is required" },
			{ status: 400 }
		);
	}
	const media = await MediaCollection.findById(params.mediaId);

	if (!media) {
		throw new NotFoundError("Media not found");
	}

	const command = new GetObjectCommand({
		Bucket: media.s3Bucket,
		Key: media.s3Key,
	});

	const downloadUrl = await getSignedUrl(s3Client, command, {
		expiresIn: 3600,
	});

	return NextResponse.json({
		mediaId: media._id,
		filename: media.filename,
		originalName: media.originalName,
		mimeType: media.mimeType,
		size: media.size,
		downloadUrl,
		expiresIn: 3600,
	});
});

// DELETE /api/media/[mediaId] - Delete media
export const DELETE = withErrorHandler<RouteParams>()(async (req, context) => {
	const params = await context?.params;
	// Validate mediaId parameter
	if (!params?.mediaId) {
		return NextResponse.json(
			{ error: "Media ID is required" },
			{ status: 400 }
		);
	}
	const media = await MediaCollection.findById(params.mediaId);

	if (!media) {
		throw new NotFoundError("Media not found");
	}

	// Delete from S3
	const deleteCommand = new DeleteObjectCommand({
		Bucket: media.s3Bucket,
		Key: media.s3Key,
	});

	await s3Client.send(deleteCommand);

	// Delete from database
	await MediaCollection.delete(params.mediaId);

	return NextResponse.json({ success: true });
});
