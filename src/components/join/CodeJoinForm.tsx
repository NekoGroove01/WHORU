// app/join/components/CodeJoinForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Form validation schema
const joinGroupSchema = z.object({
	groupCode: z.string().min(1, "Please enter a group code or name"),
	password: z.string().optional(),
});

type CodeJoinFormProps = {
	onSuccessfulJoin: (groupId: string) => void;
};

export default function CodeJoinForm({ onSuccessfulJoin }: Readonly<CodeJoinFormProps>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [requiresPassword, setRequiresPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(joinGroupSchema),
		defaultValues: {
			groupCode: "",
			password: "",
		},
	});

	// Simulate checking if a group requires a password
	const checkGroupRequiresPassword = (groupCode: string) => {
		// This would be an API call in a real application
		return groupCode.includes("private");
	};

	const onSubmit = async (data: any) => {
		setIsSubmitting(true);

		try {
			if (!requiresPassword) {
				// Check if the group exists and requires a password
				const needsPassword = checkGroupRequiresPassword(data.groupCode);
				if (needsPassword) {
					setRequiresPassword(true);
					setIsSubmitting(false);
					return;
				}
			}

			// Would make an API call here to join the group
			console.log("Joining group with data:", data);

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Call the success handler
			onSuccessfulJoin(data.groupCode);
		} catch (error) {
			console.error("Error joining group:", error);
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
			<div>
				<label
					htmlFor="groupCode"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Group Code or Name*
				</label>
				<input
					id="groupCode"
					type="text"
					{...register("groupCode")}
					className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
					placeholder="Enter the group code or name..."
				/>
				{errors.groupCode && (
					<p className="mt-1 text-xs sm:text-sm text-red-600">
						{errors.groupCode.message}
					</p>
				)}
			</div>

			{requiresPassword && (
				<PasswordField
					register={register}
					errors={errors}
					showPassword={showPassword}
					setShowPassword={setShowPassword}
				/>
			)}

			<div className="pt-3">
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					type="submit"
					disabled={isSubmitting}
					className="w-full py-2.5 sm:py-3 px-6 bg-[#426EFF] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
				>
					{isSubmitting
						? "Joining..."
						: requiresPassword
						? "Join Private Group"
						: "Join Group"}
				</motion.button>
			</div>
		</form>
	);
}

// Extracted password field component
function PasswordField({
	register,
	errors,
	showPassword,
	setShowPassword,
}: any) {
	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: "auto" }}
			className="overflow-hidden"
		>
			<div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs sm:text-sm text-gray-700">
				This is a private group that requires a password.
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Group Password*
				</label>
				<div className="relative">
					<input
						id="password"
						type={showPassword ? "text" : "password"}
						{...register("password")}
						className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
						placeholder="Enter the group password..."
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
					>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</button>
				</div>
				{errors.password && (
					<p className="mt-1 text-xs sm:text-sm text-red-600">
						{errors.password.message}
					</p>
				)}
			</div>
		</motion.div>
	);
}
