// app/create/page.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft, FiLock, FiGlobe, FiEye, FiEyeOff } from "react-icons/fi";
import TextareaAutosize from "react-textarea-autosize";

// Form validation schema
const createGroupSchema = z.object({
	groupName: z
		.string()
		.min(3, "Group name must be at least 3 characters")
		.max(50, "Group name must be less than 50 characters"),
	description: z
		.string()
		.max(200, "Description must be less than 200 characters")
		.optional(),
	isPrivate: z.boolean(),
	password: z
		.string()
		.optional()
		.or(
			z
				.string()
				.min(6, "Password must be at least 6 characters")
				.max(50, "Password must be less than 50 characters")
		),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export default function CreateGroup() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<CreateGroupFormData>({
		resolver: zodResolver(createGroupSchema),
		defaultValues: {
			groupName: "",
			description: "",
			isPrivate: false,
			password: "",
		},
	});

	const isPrivate = watch("isPrivate");

	const onSubmit = async (data: CreateGroupFormData) => {
		setIsSubmitting(true);

		try {
			// Would make an API call here to create the group
			console.log("Group data:", data);

			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Redirect to the new group (this is just a placeholder)
			window.location.href = `/group/${encodeURIComponent(data.groupName)}`;
		} catch (error) {
			console.error("Error creating group:", error);
			setIsSubmitting(false);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
			<div className="w-full max-w-xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center text-gray-600 hover:text-[#426EFF] mb-4 sm:mb-6 text-sm sm:text-base transition-colors"
				>
					<FiArrowLeft className="mr-2" /> Back to home
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-white rounded-xl shadow-md p-6 sm:p-8"
				>
					<h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
						Create a Question Space
					</h1>
					<p className="text-gray-600 mb-6 text-sm sm:text-base">
						Set up a new group where people can ask and answer questions
						anonymously.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-5 sm:space-y-6"
					>
						<div>
							<label
								htmlFor="groupName"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Group Name*
							</label>
							<input
								id="groupName"
								type="text"
								{...register("groupName")}
								className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
								placeholder="Give your group a name..."
							/>
							{errors.groupName && (
								<p className="mt-1 text-xs sm:text-sm text-red-600">
									{errors.groupName.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Description <span className="text-gray-400">(optional)</span>
							</label>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextareaAutosize
										id="description"
										{...field}
										minRows={2}
										maxRows={3}
										className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent resize-none"
										placeholder="Describe what this group is about..."
									/>
								)}
							/>
							{errors.description && (
								<p className="mt-1 text-xs sm:text-sm text-red-600">
									{errors.description.message}
								</p>
							)}
						</div>

						<div className="border-t border-gray-200 pt-5">
							<h2 className="text-lg font-medium mb-3">Group Visibility</h2>

							<div className="space-y-3 sm:space-y-4">
								<div className="flex items-center">
									<Controller
										name="isPrivate"
										control={control}
										render={({ field: { onChange, value } }) => (
											<div className="flex items-center space-x-3 sm:space-x-4">
												<button
													type="button"
													onClick={() => onChange(false)}
													className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 transition-all ${
														!value
															? "border-[#426EFF] bg-blue-50 text-[#426EFF]"
															: "border-gray-300 text-gray-700 hover:bg-gray-50"
													}`}
												>
													<FiGlobe className="mr-2" />
													<span className="text-sm sm:text-base font-medium">
														Public
													</span>
												</button>

												<button
													type="button"
													onClick={() => onChange(true)}
													className={`flex items-center px-3 py-2 sm:px-4 sm:py-3 rounded-lg border-2 transition-all ${
														value
															? "border-[#426EFF] bg-blue-50 text-[#426EFF]"
															: "border-gray-300 text-gray-700 hover:bg-gray-50"
													}`}
												>
													<FiLock className="mr-2" />
													<span className="text-sm sm:text-base font-medium">
														Private
													</span>
												</button>
											</div>
										)}
									/>
								</div>

								<div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
									{isPrivate
										? "Private groups require a password to join and won't appear in search results."
										: "Public groups are visible to everyone and anyone can join without a password."}
								</div>

								{isPrivate && (
									<div className="mt-3">
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
												placeholder="Create a password for your group..."
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
								)}
							</div>
						</div>

						<div className="pt-3">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="submit"
								disabled={isSubmitting}
								className="w-full py-2.5 sm:py-3 px-6 bg-[#426EFF] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
							>
								{isSubmitting ? "Creating..." : "Create Group"}
							</motion.button>
						</div>
					</form>
				</motion.div>

				<div className="text-center mt-4 text-gray-500 text-xs sm:text-sm">
					<p>
						Need help?{" "}
						<Link href="/faq" className="text-[#426EFF] hover:underline">
							Check our FAQ
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
