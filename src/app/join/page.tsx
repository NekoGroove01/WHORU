"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaArrowLeft, FaQrcode, FaLink } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";

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
const joinSchema = z.object({
	groupId: z.string().min(1, "Group ID or invite link is required"),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinPage() {
	const router = useRouter();
	const [joinMethod, setJoinMethod] = useState<"link" | "qr">("link");
	const [showScanner, setShowScanner] = useState(false);

	// Form handling
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<JoinFormValues>({
		resolver: zodResolver(joinSchema),
		defaultValues: {
			groupId: "",
		},
	});

	const onSubmit = async (data: JoinFormValues) => {
		try {
			// Extract group ID from input (could be a full URL or just an ID)
			const groupId = extractGroupId(data.groupId);

			// Here you would verify the group exists in your backend
			// const response = await fetch(`/api/groups/verify/${groupId}`)

			// For now, we'll just redirect to the group
			setTimeout(() => {
				router.push(`/group/${groupId}`);
			}, 1000);
		} catch (error) {
			console.error("Failed to join group:", error);
		}
	};

	// Helper to extract a group ID from either a full URL or just the ID
	const extractGroupId = (input: string): string => {
		// If it's a URL, extract the last path segment
		if (input.startsWith("http")) {
			try {
				const url = new URL(input);
				const pathSegments = url.pathname.split("/");
				return pathSegments[pathSegments.length - 1];
			} catch (error) {
				console.error("Invalid URL:", error);
				return input.trim();
			}
		}
		return input.trim();
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
					<Link
						href="/"
						className="inline-flex items-center text-primary dark:text-primary-light mb-8 hover:underline"
					>
						<FaArrowLeft className="mr-2" /> Back to Home
					</Link>
				</motion.div>

				<motion.div
					variants={fadeIn}
					className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
				>
					<motion.h2
						variants={fadeIn}
						className="text-3xl md:text-4xl font-bold mb-6 text-center"
					>
						Join a Group
					</motion.h2>

					<motion.div variants={fadeIn} className="flex justify-center mb-6">
						<div className="inline-flex rounded-md shadow-sm">
							<button
								type="button"
								onClick={() => setJoinMethod("link")}
								className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
									joinMethod === "link"
										? "bg-primary text-white border-primary"
										: "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
								} flex items-center`}
							>
								<FaLink className="mr-2" /> Via Link
							</button>
							<button
								type="button"
								onClick={() => {
									setJoinMethod("qr");
									setShowScanner(true);
								}}
								className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
									joinMethod === "qr"
										? "bg-primary text-white border-primary"
										: "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
								} flex items-center`}
							>
								<FaQrcode className="mr-2" /> Scan QR
							</button>
						</div>
					</motion.div>

					{joinMethod === "link" ? (
						<motion.form
							variants={fadeIn}
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div>
								<label
									htmlFor="groupId"
									className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Enter group code or paste invite link
								</label>
								<TextareaAutosize
									id="groupId"
									{...register("groupId")}
									className={`w-full px-3 py-2 border rounded-md ${
										errors.groupId
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
									placeholder="e.g., abc123 or https://whoru.app/join/abc123"
									minRows={2}
								/>
								{errors.groupId && (
									<p className="mt-1 text-sm text-red-500">
										{errors.groupId.message}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full btn-primary flex items-center justify-center"
							>
								{isSubmitting ? "Joining..." : "Join Group"}
							</button>
						</motion.form>
					) : (
						<motion.div
							variants={fadeIn}
							className="flex flex-col items-center justify-center p-4"
						>
							{showScanner ? (
								<div className="w-full max-w-xs">
									<div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center">
										{/* QR Scanner Component would go here */}
										<p className="text-center text-gray-500 dark:text-gray-400 px-4">
											Camera access required for QR scanning. Please allow when
											prompted.
										</p>
									</div>
									<button
										onClick={() => setShowScanner(false)}
										className="mt-4 w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
									>
										Cancel Scanning
									</button>
								</div>
							) : (
								<div className="text-center p-4">
									<p className="text-gray-600 dark:text-gray-400 mb-4">
										Click the &quot;Scan QR&quot; button to activate your camera
										and scan a group QR code.
									</p>
									<button
										onClick={() => setShowScanner(true)}
										className="btn-primary"
									>
										Start Scanner
									</button>
								</div>
							)}
						</motion.div>
					)}
				</motion.div>

				<motion.div
					variants={fadeIn}
					className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm"
				>
					<p>
						Don&apos;t have a group to join?{" "}
						<Link
							href="/create"
							className="text-primary dark:text-primary-light hover:underline"
						>
							Create one
						</Link>
					</p>
				</motion.div>
			</div>
		</motion.div>
	);
}
