import { NextResponse } from "next/server";
import { MediaCollection } from "@/lib/db/collections/media";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreateMediaSchema } from "@/types/schemas/media";
import { validateRequest } from "@/middleware/validation";
import { withErrorHandler } from "@/middleware/errorHandler";
import { nanoid } from "nanoid";

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

// POST /api/media - Create presigned upload URL
export const POST = withErrorHandler(
	validateRequest(CreateMediaSchema)(async (req) => {
		const data = req.validatedData!;

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
		if (!allowedTypes.includes(data.mimeType)) {
			return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
		}

		const s3Key = `uploads/${nanoid()}/${data.originalName}`;
		const bucket = process.env.AWS_S3_BUCKET!;

		// Create presigned URL
		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: s3Key,
			ContentType: data.mimeType,
			ContentLength: data.size,
		});

		const uploadUrl = await getSignedUrl(s3Client, command, {
			expiresIn: 3600,
		});

		// Create media record
		const media = await MediaCollection.create({
			...data,
			s3Key,
			s3Bucket: bucket,
		});

		return NextResponse.json({
			mediaId: media._id,
			uploadUrl,
			expiresIn: 3600,
		});
	})
);
