import { NextResponse } from "next/server";
import { GroupsCollection } from "@/lib/db/collections/groups";
import { UnauthorizedError, withValidation } from "@/middleware/withMiddleware";
import bcrypt from "bcrypt";
import { z } from "zod";

const ChangePasswordSchema = z.object({
	currentPassword: z
		.string()
		.min(6, "Current password must be at least 6 characters"),
	newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// POST /api/groups/[groupId]/change-password - Change admin password
export const POST = withValidation(ChangePasswordSchema)(
	async (req, context) => {
		const params = await context?.params;

		// Validate groupId parameter
		if (!params?.groupId) {
			return NextResponse.json(
				{ error: "Group ID is required" },
				{ status: 400 }
			);
		}

		const { currentPassword, newPassword } = req.validatedData!;

		// Verify current password
		const isValidCurrentPassword = await GroupsCollection.verifyAdminPassword(
			params.groupId,
			currentPassword
		);

		if (!isValidCurrentPassword) {
			throw new UnauthorizedError("Current password is incorrect");
		}

		// Hash the new password
		const saltRounds = 10;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update the password
		const updatedGroup = await GroupsCollection.updateAdminPassword(
			params.groupId,
			hashedNewPassword
		);

		if (!updatedGroup) {
			return NextResponse.json(
				{ error: "Failed to update password" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Password changed successfully",
		});
	}
);
