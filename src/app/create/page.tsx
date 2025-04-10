"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	FaArrowLeft,
	FaLock,
	FaGlobe,
	FaRegCopy,
	FaQrcode,
	FaCheck,
} from "react-icons/fa";
import { nanoid } from "nanoid";
import { useBackNavigation } from "../hooks/useBackNavigation";

// Animation variants
const fadeIn = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4 },
	},
};

const pageVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

// Form schema using zod
const createSchema = z.object({
	groupName: z
		.string()
		.min(3, "Group name must be at least 3 characters")
		.max(50, "Group name cannot exceed 50 characters"),
	description: z
		.string()
		.max(200, "Description cannot exceed 200 characters")
		.optional(),
	isPublic: z.boolean().default(false),
});

type CreateFormValues = z.infer<typeof createSchema>;

export default function CreatePage() {
	const router = useRouter();
	// navigation for going previous page
	const { goBack } = useBackNavigation("/");
	const [isCreated, setIsCreated] = useState(false);
	const [groupInfo, setGroupInfo] = useState<{
		id: string;
		name: string;
		isPublic: boolean;
	} | null>(null);
	const [linkCopied, setLinkCopied] = useState(false);

	// Form handling
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CreateFormValues>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			groupName: "",
			description: "",
			isPublic: false,
		},
	});

	const isPublic = watch("isPublic");

	const onSubmit = async (data: CreateFormValues) => {
		try {
			// Simulate API call to create group
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const newGroupId = nanoid(10); // Generate a unique ID for the group

			// Here you would create the group in your backend
			// const response = await fetch('/api/groups', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(data)
			// })

			setGroupInfo({
				id: newGroupId,
				name: data.groupName,
				isPublic: data.isPublic,
			});

			setIsCreated(true);
		} catch (error) {
			console.error("Failed to create group:", error);
		}
	};

	const copyInviteLink = () => {
		if (!groupInfo) return;

		const inviteLink = `${window.location.origin}/group/${groupInfo.id}`;
		navigator.clipboard
			.writeText(inviteLink)
			.then(() => {
				setLinkCopied(true);
				setTimeout(() => setLinkCopied(false), 2000);
			})
			.catch((err) => console.error("Failed to copy link:", err));
	};

	const goToGroup = () => {
		if (!groupInfo) return;
		router.push(`/group/${groupInfo.id}`);
	};

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={pageVariants}
			className="min-h-screen flex flex-col"
		>
			<div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center max-w-lg">
				<motion.div variants={fadeIn} className="w-full">
					<button
						onClick={goBack}
						className="inline-flex items-center text-primary dark:text-primary-light mb-8 hover:underline"
					>
						<FaArrowLeft className="mr-2" /> Back to Home
					</button>
				</motion.div>

				<motion.div
					variants={fadeIn}
					className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
				>
					{!isCreated ? (
						<>
							<motion.h2
								variants={fadeIn}
								className="font-bold mb-6 text-center"
							>
								Create a New Group
							</motion.h2>

							<motion.form
								variants={fadeIn}
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<div>
									<label
										htmlFor="groupName"
										className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Group Name*
									</label>
									<input
										id="groupName"
										type="text"
										{...register("groupName")}
										className={`w-full px-3 py-2 border rounded-md ${
											errors.groupName
												? "border-red-500"
												: "border-gray-300 dark:border-gray-600"
										} dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
										placeholder="E.g., Team Brainstorming"
									/>
									{errors.groupName && (
										<p className="mt-1 text-sm text-red-500">
											{errors.groupName.message}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="description"
										className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
									>
										Description (optional)
									</label>
									<textarea
										id="description"
										{...register("description")}
										rows={3}
										className={`w-full px-3 py-2 border rounded-md ${
											errors.description
												? "border-red-500"
												: "border-gray-300 dark:border-gray-600"
										} dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
										placeholder="What's this group about?"
									/>
									{errors.description && (
										<p className="mt-1 text-sm text-red-500">
											{errors.description.message}
										</p>
									)}
								</div>

								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<div className="flex items-start space-x-3">
										<div className="flex items-center h-5">
											<input
												id="isPublic"
												type="checkbox"
												{...register("isPublic")}
												className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
											/>
										</div>
										<div className="flex-1">
											<label
												htmlFor="isPublic"
												className="block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												Make this group public
											</label>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
												Public groups can be discovered by anyone. Private
												groups require an invite link.
											</p>
										</div>
									</div>

									<div className="mt-3 ml-7">
										<div className="flex items-center text-sm">
											{isPublic ? (
												<>
													<FaGlobe className="text-primary dark:text-primary-light mr-2" />
													<span className="text-gray-700 dark:text-gray-300">
														Anyone can find and join this group
													</span>
												</>
											) : (
												<>
													<FaLock className="text-gray-500 mr-2" />
													<span className="text-gray-700 dark:text-gray-300">
														Only people with the link can join
													</span>
												</>
											)}
										</div>
									</div>
								</div>

								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full btn-primary flex items-center justify-center"
								>
									{isSubmitting ? "Creating..." : "Create Group"}
								</button>
							</motion.form>
						</>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center"
						>
							<div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
								<FaCheck className="text-3xl text-green-600 dark:text-green-400" />
							</div>

							<h2 className="text-2xl font-bold mb-2">Group Created!</h2>
							<p className="text-gray-600 dark:text-gray-400 mb-6">
								Your {groupInfo?.isPublic ? "public" : "private"} group &quot;
								{groupInfo?.name}&quot; is ready.
							</p>

							<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
								<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
									Share this invite link:
								</p>

								<div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-2">
									<span className="text-gray-600 dark:text-gray-400 text-sm truncate flex-1">
										{`${window.location.origin}/group/${groupInfo?.id}`}
									</span>
									<button
										onClick={copyInviteLink}
										className="ml-2 p-2 text-gray-500 hover:text-primary"
										aria-label="Copy invite link"
									>
										{linkCopied ? (
											<FaCheck className="text-green-500" />
										) : (
											<FaRegCopy />
										)}
									</button>
								</div>

								<div className="mt-4 flex justify-center">
									<div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
										<FaQrcode className="text-lg" />
										<span>QR code available in group settings</span>
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<button onClick={goToGroup} className="w-full btn-primary">
									Go to Group
								</button>
								<Link href="/" className="w-full btn-secondary">
									Back to Home
								</Link>
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
}
