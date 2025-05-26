import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
	region: process.env.AWS_REGION ?? "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
	},
});

const S3_BUCKET = process.env.S3_BUCKET_NAME!;
const UPLOAD_URL_EXPIRY = 300; // 5 minutes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function generatePresignedUploadUrl(
	key: string,
	contentType: string,
	contentLength: number
): Promise<string> {
	if (contentLength > MAX_FILE_SIZE) {
		throw new Error(
			`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`
		);
	}

	const command = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		ContentType: contentType,
		ContentLength: contentLength,
	});

	return await getSignedUrl(s3Client, command, {
		expiresIn: UPLOAD_URL_EXPIRY,
	});
}

export async function deleteS3Object(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
	});

	await s3Client.send(command);
}

export async function checkS3ObjectExists(key: string): Promise<boolean> {
	try {
		const command = new HeadObjectCommand({
			Bucket: S3_BUCKET,
			Key: key,
		});

		await s3Client.send(command);
		return true;
	} catch (error) {
		const awsError = error as { name: string };
		console.error(
			`Error checking S3 object existence: ${awsError.name}`,
			error
		);
		return false;
	}
}

export function getPublicUrl(key: string): string {
	// If using CloudFront, replace with CloudFront URL
	const cloudFrontUrl = process.env.CLOUDFRONT_URL;
	if (cloudFrontUrl) {
		return `${cloudFrontUrl}/${key}`;
	}

	return `https://${S3_BUCKET}.s3.${
		process.env.AWS_REGION ?? "us-east-1"
	}.amazonaws.com/${key}`;
}

export { S3_BUCKET, MAX_FILE_SIZE };
