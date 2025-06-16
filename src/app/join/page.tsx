"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaArrowLeft, FaQrcode, FaLink, FaCamera } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { fadeIn, pageVariants } from "@/utils/basicMotion";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import axios from "axios";
import { useModalStore } from "@/store/modalStore";
import { useAccessKey } from "@/hooks/useAccessKey";

// Form schema using zod
const joinSchema = z.object({
	accessKey: z.string().min(1, "Group ID or invite link is required"),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinPage() {
	const router = useRouter();
	// navigation for going previous page
	const { goBack } = useBackNavigation("/");
	const [joinMethod, setJoinMethod] = useState<"link" | "qr">("link");
	const [showScanner, setShowScanner] = useState(false);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const { showError, showSuccess } = useModalStore();
	// Save access key in local storage
	const { setAccessKey } = useAccessKey();

	// Form handling
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<JoinFormValues>({
		resolver: zodResolver(joinSchema),
		defaultValues: {
			accessKey: "",
		},
	});

	// Detect if user is on mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Start camera function
	const startCamera = useCallback(async () => {
		try {
			setCameraError(null);

			// Request camera access
			const constraints = {
				video: {
					facingMode: isMobile ? "environment" : "user",
					width: { ideal: 1280 },
					heaight: { ideal: 720 },
				},
			};

			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			streamRef.current = stream;

			// Connect stream to video element
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (error) {
			console.error("Camera access denied:", error);
			if (error instanceof DOMException && error.name === "NotAllowedError") {
				setCameraError("Camera access denied. Please allow camera access.");
			} else if (
				error instanceof DOMException &&
				error.name === "NotFoundError"
			) {
				setCameraError("No camera found on this device.");
			} else {
				setCameraError(
					"An error occurred while accessing the camera. Try again."
				);
			}
		}
	}, [isMobile]);

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
	};

	// Switch camera on mobile if possible
	const switchCamera = async () => {
		const currentMode = streamRef.current
			?.getVideoTracks()[0]
			.getSettings().facingMode;
		const newMode = currentMode === "environment" ? "user" : "environment";

		stopCamera();

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: newMode },
			});

			streamRef.current = stream;

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
		} catch (error) {
			console.error("Error switching camera:", error);
			setCameraError("Failed to switch camera. Please try again.");
			startCamera();
		}
	};

	// Camera access and cleanup
	useEffect(() => {
		if (showScanner && videoRef.current) {
			startCamera();
		}

		return () => {
			stopCamera();
		};
	}, [showScanner, startCamera]);

	const onSubmit = async (data: JoinFormValues) => {
		try {
			// Extract group ID from input (could be a full URL or just an ID)
			const accessKey = extractAccessKey(data.accessKey);

			// Here you would verify the group exists in your backend
			const response = await axios.post("/api/groups/join", {
				accessKey,
			});

			if (response.status !== 200) {
				throw new Error("Failed to join group");
			}

			const groupId: string = response.data.id;

			// Save access key using hook for future use
			setAccessKey(groupId, accessKey);

			showSuccess(
				"Join Group Success",
				"You have successfully joined the group!",
				() => router.push(`/group/${groupId}`)
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An error occurred";
			showError("Join Group Failed", errorMessage);
		}
	};

	// Helper to extract accessKey from either a full URL or just the access key
	const extractAccessKey = (input: string): string => {
		const trimmedInput = input.trim();

		// If it's a URL, extract accessKey from query parameter or path
		if (trimmedInput.startsWith("http")) {
			try {
				const url = new URL(trimmedInput);

				// First check if there's an accessKey query parameter (for private groups)
				const accessKeyParam = url.searchParams.get("accessKey");
				if (accessKeyParam) {
					return accessKeyParam;
				}

				// For group URLs like /group/[id], extract the group ID from path
				const pathSegments = url.pathname.split("/").filter(Boolean);
				if (pathSegments.length >= 2 && pathSegments[0] === "group") {
					return pathSegments[1]; // This is the group ID, which serves as accessKey for public groups
				}

				// If no specific pattern found, use the last path segment (legacy support)
				return pathSegments[pathSegments.length - 1] || "";
			} catch (error) {
				console.error("Invalid URL format:", input, error);
				throw new Error("Please enter a valid URL or access key.");
			}
		}

		// If it's not a URL, treat it as a direct access key
		return trimmedInput;
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
									htmlFor="accessKey"
									className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
								>
									Enter group code or paste invite link
								</label>
								<TextareaAutosize
									id="accessKey"
									{...register("accessKey")}
									className={`w-full px-3 py-2 border rounded-md ${
										errors.accessKey
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary`}
									placeholder="e.g., abc123 or https://whoru.app/join/abc123"
									minRows={2}
								/>
								{errors.accessKey && (
									<p className="mt-1 text-sm text-red-500">
										{errors.accessKey.message}
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
								<div className="w-full max-w-md">
									{/* Camera viewport */}
									<div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
										{cameraError ? (
											<div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-800">
												<p className="text-center text-white">{cameraError}</p>
											</div>
										) : (
											<>
												<video
													ref={videoRef}
													autoPlay
													playsInline
													muted
													className="w-full h-full object-cover"
												/>
												{/* Scanner guide overlay */}
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="w-64 h-64 border-2 border-white border-opacity-70 rounded-lg"></div>
												</div>
												{/* Scanning animation */}
												<div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary-lighter opacity-70">
													<motion.div
														className="absolute inset-0"
														animate={{
															y: [-50, 50, -50],
														}}
														transition={{
															duration: 2.5,
															repeat: Infinity,
															ease: "easeInOut",
														}}
													/>
												</div>
											</>
										)}
									</div>

									{/* Camera controls */}
									<div className="flex justify-between mb-4">
										<button
											onClick={() => setShowScanner(false)}
											className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm flex-1 mr-2"
										>
											Cancel
										</button>
										{isMobile && (
											<button
												onClick={switchCamera}
												className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
											>
												<FaCamera /> Switch Camera
											</button>
										)}
									</div>

									<p className="text-sm text-gray-600 dark:text-gray-400 text-center">
										Position the QR code within the frame to scan it
									</p>
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
