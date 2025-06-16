import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { NotFoundError, withErrorHandler } from "@/middleware/withMiddleware";
import bcrypt from "bcrypt";
import z from "zod";

// Define route parameters type
type RouteParams = {
	groupId: string;
	params: Promise<{ groupId: string }>;
};

const ResetPasswordSchema = z
	.object({
		newAdminPassword: z
			.string()
			.min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(6),
		// 임시로 마스터 키나 특별한 인증 방식을 사용할 수 있습니다
		masterKey: z.string().optional(),
	})
	.refine((data) => data.newAdminPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

// POST /api/groups/[groupId]/reset-password - Reset admin password (emergency use)
export const POST = withErrorHandler<RouteParams>()(async (req, context) => {
	try {
		const params = await context?.params;
		if (!params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const validatedData = ResetPasswordSchema.parse(body);

		// 보안을 위해 마스터 키 확인 (실제 환경에서는 더 안전한 방법 사용)
		const masterKey = process.env.MASTER_RESET_KEY || "emergency-reset-2024";
		if (validatedData.masterKey !== masterKey) {
			return NextResponse.json(
				{ error: "Master key required for password reset" },
				{ status: 403 }
			);
		}

		const group = await GroupsCollection.findById(params.groupId);

		if (!group) {
			throw new NotFoundError("Group not found");
		}

		// 새 패스워드 해시 생성
		const hashedPassword = await bcrypt.hash(
			validatedData.newAdminPassword,
			10
		);

		const updatedGroup = await GroupsCollection.updateAdminPassword(
			params.groupId,
			hashedPassword
		);

		if (!updatedGroup) {
			throw new Error("Failed to update password");
		}

		return NextResponse.json({
			success: true,
			message: "Admin password reset successfully",
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Validation failed", details: error.errors },
				{ status: 400 }
			);
		}
		throw error;
	}
});
