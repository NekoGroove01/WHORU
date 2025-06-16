"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import {
	FaArrowLeft,
	FaSave,
	FaTrash,
	FaLock,
	FaGlobe,
	FaTags,
	FaShareAlt,
	FaCheckCircle,
	FaExclamationTriangle,
	FaQrcode,
	FaQuestionCircle,
	FaHome,
	FaSearch,
	FaKey,
} from "react-icons/fa";
import { useGroupStore } from "@/store/groupStore";
import SettingsSection from "@/components/group/settings/SettingsSection";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import QRCodeGenerator from "@/components/group/settings/QRCodeGenerator";
import TagManager from "@/components/group/settings/TagManager";
import { Group } from "@/types/group";
import TextareaAutosize from "react-textarea-autosize";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useAccessKey } from "@/hooks/useAccessKey";
import { useInputModal } from "@/hooks/useInputModal";
import { fadeIn, staggerContainer } from "@/utils/basicMotion";

export default function GroupSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const groupId: string = (params?.id as string) ?? "";

	// navigation for going previous page
	const { goBack } = useBackNavigation("/");

	// access key management
	const { getAccessKey } = useAccessKey();

	// input modal for password change
	const { getInput, getInputWithAsyncHandler } = useInputModal();

	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [copySuccess, setCopySuccess] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"general" | "invite" | "tags">(
		"general"
	);

	// Form state
	const [formState, setFormState] = useState<{
		name: string;
		description: string;
		isPublic: boolean;
	}>({
		name: "",
		description: "",
		isPublic: false,
	});

	// Group store
	const { group, fetchGroup, updateGroup, deleteGroup } = useGroupStore();

	// Check authentication on page load
	useEffect(() => {
		const checkAuth = () => {
			const authToken = sessionStorage.getItem(`admin_auth_${groupId}`);
			const timestamp = sessionStorage.getItem(
				`admin_auth_timestamp_${groupId}`
			);

			if (!authToken || !timestamp) {
				router.push(`/group/${groupId}`);
				return;
			}

			// Check if token is older than 24 hours (86400000 ms)
			const tokenAge = Date.now() - parseInt(timestamp);
			if (tokenAge > 86400000) {
				sessionStorage.removeItem(`admin_auth_${groupId}`);
				sessionStorage.removeItem(`admin_auth_timestamp_${groupId}`);
				router.push(`/group/${groupId}`);
				return;
			}

			setIsAuthorized(true);
			setIsCheckingAuth(false);
		};

		checkAuth();
	}, [groupId, router]);

	// Load group data
	useEffect(() => {
		if (!isAuthorized) return;

		const loadGroup = async () => {
			setIsLoading(true);
			try {
				// Settings 페이지에서는 이미 인증된 상태이지만, private group의 경우 accessKey가 필요할 수 있음
				const accessKey = getAccessKey(groupId);
				await fetchGroup(groupId, accessKey);
			} catch (error) {
				console.error("Error loading group:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadGroup();
	}, [groupId, fetchGroup, isAuthorized, getAccessKey]);

	// Update form when group data loads
	useEffect(() => {
		if (group) {
			setFormState({
				name: group.name || "",
				description: group.description || "",
				isPublic: !!group.isPublic,
			});
		}
	}, [group]);

	// Handle form changes
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setFormState((prev) => ({ ...prev, [name]: checked }));
	};

	// Save settings
	const handleSaveSettings = async () => {
		if (!group) return;

		try {
			// Reset status messages
			setSaveSuccess(false);
			setSaveError(null);

			// 어드민 패스워드를 사용자 입력을 받음 input modal로
			const adminPassword = await getInput({
				title: "Admin Password",
				message: "Enter your admin password to save changes.",
				inputLabel: "Admin Password",
				inputPlaceholder: "Enter admin password...",
				inputType: "password",
				validation: (value) => {
					if (!value.trim()) return "Admin password is required";
					if (value.length < 6) return "Password must be at least 6 characters";
					return null;
				},
				submitLabel: "Save Settings",
				cancelLabel: "Cancel",
			});
			if (!adminPassword) {
				setSaveError("Admin password is required to save settings.");
				return;
			}

			// Create request data for API
			const requestData = {
				name: formState.name,
				description: formState.description,
				isPublic: formState.isPublic,
				tags: group.tags || [], // Keep existing tags
				adminPassword: adminPassword, // 관리자 패스워드 포함
			};

			// PUT request to update group settings
			const response = await axios.put(
				`/api/groups/${groupId}`, // 올바른 API 경로
				requestData,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			// API 응답 확인
			if (response.status !== 200) {
				throw new Error("Failed to update group");
			}

			// Create updated group object for store
			const updatedGroup: Group = {
				...group,
				name: formState.name,
				description: formState.description,
				isPublic: formState.isPublic,
				tags: group.tags || [], // Keep existing tags
				updatedAt: new Date().toISOString(), // 업데이트 시간 갱신
			};

			// Update group in store
			await updateGroup(updatedGroup);

			// Show success message
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving settings:", error);

			// 더 구체적인 에러 메시지 처리
			if (axios.isAxiosError(error)) {
				const errorMessage = error.response?.data?.error || error.message;
				setSaveError(`Failed to save settings: ${errorMessage}`);
			} else {
				setSaveError("Failed to save settings. Please try again.");
			}
		}
	};

	// Generate invite link with accessKey if needed
	const generateInviteLink = () => {
		let inviteLink = `${window.location.origin}/group/${groupId}`;

		if (group && !group.isPublic) {
			const accessKey = getAccessKey(groupId);
			inviteLink += `?accessKey=${accessKey}`;
		}

		return inviteLink;
	};

	// Handle copy link
	const handleCopyLink = () => {
		const inviteLink = generateInviteLink();
		navigator.clipboard.writeText(inviteLink);
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 8000);
	};

	// Handle delete group confirmation
	const handleDeleteGroup = async () => {
		try {
			// Get admin password from user input with input modal
			const adminPassword = await getInput({
				title: "Delete Group",
				message: "Enter your admin password to confirm deletion.",
				inputLabel: "Admin Password",
				inputPlaceholder: "Enter admin password...",
				inputType: "password",
				validation: (value) => {
					if (!value.trim()) return "Admin password is required";
					if (value.length < 6) return "Password must be at least 6 characters";
					return null;
				},
				submitLabel: "Delete Group",
				cancelLabel: "Cancel",
			});
			if (!adminPassword) {
				setSaveError("Admin password is required to delete the group.");
				return;
			}

			await deleteGroup(groupId, adminPassword);
			router.push("/");
		} catch (error) {
			console.error("Error deleting group:", error);
			setSaveError(
				"Failed to delete group. Please check your password and try again."
			);
		}
	};

	// Handle change password using input modal
	const handleChangePassword = () => {
		// First step: Get current password
		getInputWithAsyncHandler(
			{
				title: "Change Admin Password",
				message: "Enter your current password to verify your identity.",
				inputLabel: "Current Password",
				inputPlaceholder: "Enter current admin password...",
				inputType: "password",
				validation: (value) => {
					if (!value.trim()) return "Current password is required";
					if (value.length < 6) return "Password must be at least 6 characters";
					return null;
				},
				submitLabel: "Next",
				cancelLabel: "Cancel",
			},
			async (currentPassword) => {
				// Second step: Get new password and change it
				await handleNewPasswordInput(currentPassword);
			}
		);
	};

	// Separate function to handle new password input
	const handleNewPasswordInput = async (currentPassword: string) => {
		return new Promise<void>((resolve, reject) => {
			getInputWithAsyncHandler(
				{
					title: "Set New Password",
					message: "Enter a new admin password for this group.",
					inputLabel: "New Password",
					inputPlaceholder: "Enter new admin password...",
					inputType: "password",
					validation: (value) => {
						if (!value.trim()) return "New password is required";
						if (value.length < 6)
							return "Password must be at least 6 characters";
						if (value === currentPassword)
							return "New password must be different from current password";
						return null;
					},
					submitLabel: "Change Password",
					cancelLabel: "Cancel",
				},
				async (newPassword) => {
					try {
						await changePasswordAPI(currentPassword, newPassword);
						resolve();
					} catch (error) {
						reject(error);
					}
				}
			);
		});
	};

	// Separate function to handle the API call
	const changePasswordAPI = async (
		currentPassword: string,
		newPassword: string
	) => {
		try {
			const response = await axios.post(
				`/api/groups/${groupId}/change-password`,
				{
					currentPassword,
					newPassword,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status !== 200) {
				throw new Error("Failed to change password");
			}
		} catch (error) {
			console.error("Error changing password:", error);
			let errorMessage = "Failed to change password";

			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					errorMessage = "Current password is incorrect";
				} else if (error.response?.data?.error) {
					errorMessage = error.response.data.error;
				} else if (error.response?.data?.message) {
					errorMessage = error.response.data.message;
				}
			}

			throw new Error(errorMessage);
		}
	};

	if (isCheckingAuth) {
		return <LoadingScreen text="Checking authorization..." />;
	}

	if (!isAuthorized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={staggerContainer}
					className="text-center px-6 max-w-lg"
				>
					{/* Animated Lock Icon */}
					<motion.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{
							delay: 0.2,
							type: "spring",
							stiffness: 200,
							damping: 15,
						}}
						className="mb-8 inline-flex"
					>
						<div className="relative">
							<div className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 rounded-full">
								<FaLock className="w-20 h-20 text-red-500 dark:text-red-400" />
							</div>
							{/* Animated pulse effect */}
							<motion.div
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.5, 0, 0.5],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 rounded-full"
							/>
						</div>
					</motion.div>

					{/* Content */}
					<motion.h1
						variants={fadeIn}
						className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
						style={{ letterSpacing: "-0.025em" }}
					>
						Unauthorized Access
					</motion.h1>

					<motion.p
						variants={fadeIn}
						className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
						style={{ letterSpacing: "-0.025em" }}
					>
						You need admin privileges to access this page. Please enter the
						admin password from the group page to continue.
					</motion.p>

					{/* Security info box */}
					<motion.div
						variants={fadeIn}
						className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
					>
						<div className="flex items-center justify-center gap-2 text-yellow-700 dark:text-yellow-400">
							<FaKey className="text-sm" />
							<p
								className="text-sm font-medium"
								style={{ letterSpacing: "-0.025em" }}
							>
								Admin access required for this action
							</p>
						</div>
					</motion.div>

					{/* Action button */}
					<motion.div
						variants={fadeIn}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<Link
							href={`/group/${groupId}`}
							className="btn-primary inline-flex items-center gap-3 group px-8 py-3"
						>
							<FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
							<span style={{ letterSpacing: "-0.025em" }}>Back to Group</span>
						</Link>
					</motion.div>

					{/* Additional help text */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.6 }}
						transition={{ delay: 1 }}
						className="mt-12 text-sm text-gray-500 dark:text-gray-500"
						style={{ letterSpacing: "-0.025em" }}
					>
						Need help? Contact the group administrator
					</motion.p>
				</motion.div>

				{/* Background decoration with lock pattern */}
				<div className="fixed inset-0 -z-10 overflow-hidden">
					{/* Floating lock icons */}
					{[...Array(5)].map((_, i) => (
						<motion.div
							key={i}
							initial={{
								x: Math.random() * window.innerWidth,
								y: window.innerHeight + 100,
								rotate: Math.random() * 360,
							}}
							animate={{
								y: -100,
								rotate: Math.random() * 360,
							}}
							transition={{
								duration: 20 + i * 5,
								repeat: Infinity,
								ease: "linear",
								delay: i * 2,
							}}
							className="absolute opacity-5"
						>
							<FaLock className="w-16 h-16 text-gray-400 dark:text-gray-600" />
						</motion.div>
					))}

					{/* Gradient orbs */}
					<motion.div
						animate={{
							scale: [1, 1.1, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 dark:from-red-500/5 dark:to-orange-500/5 blur-3xl"
					/>
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 1,
						}}
						className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-orange-500/10 to-red-500/10 dark:from-orange-500/5 dark:to-red-500/5 blur-3xl"
					/>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <LoadingScreen text="Loading settings..." />;
	}

	if (!group) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
				<motion.div
					initial="hidden"
					animate="visible"
					variants={fadeIn}
					className="text-center px-6 max-w-lg"
				>
					{/* Icon */}
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring" }}
						className="mb-8 inline-flex"
					>
						<div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary-dark/20 dark:to-accent-dark/20 rounded-full">
							<FaExclamationTriangle className="w-16 h-16 text-primary dark:text-primary-light" />
						</div>
					</motion.div>

					{/* Content */}
					<motion.h1
						variants={fadeIn}
						className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
						style={{ letterSpacing: "-0.025em" }}
					>
						Group Not Found
					</motion.h1>

					<motion.p
						variants={fadeIn}
						className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto"
						style={{ letterSpacing: "-0.025em" }}
					>
						The group you&apos;re looking for doesn&apos;t exist or may have
						been removed. Try searching for another group or create your own.
					</motion.p>

					{/* Action buttons */}
					<motion.div
						variants={fadeIn}
						className="flex flex-col sm:flex-row gap-4 justify-center"
					>
						<Link
							href="/"
							className="btn-primary flex items-center justify-center gap-2 group"
						>
							<FaHome className="transition-transform group-hover:-translate-x-1" />
							Go to Home
						</Link>

						<Link
							href="/browse"
							className="btn-secondary flex items-center justify-center gap-2 group"
						>
							<FaSearch className="transition-transform group-hover:scale-110" />
							Browse Groups
						</Link>
					</motion.div>

					{/* Additional help text */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.6 }}
						transition={{ delay: 0.8 }}
						className="mt-12 text-sm text-gray-500 dark:text-gray-500"
						style={{ letterSpacing: "-0.025em" }}
					>
						Error Code: 404 • Group ID not found
					</motion.p>
				</motion.div>

				{/* Background decoration */}
				<div className="fixed inset-0 -z-10 overflow-hidden">
					<motion.div
						animate={{
							y: [0, -10, 0],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary-dark/5 dark:to-accent-dark/5 blur-3xl"
					/>
					<motion.div
						animate={{
							y: [0, 10, 0],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-accent/5 to-primary/5 dark:from-accent-dark/5 dark:to-primary-dark/5 blur-3xl"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20">
			{/* Header */}
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<button
								onClick={goBack}
								className="text-primary dark:text-primary-light flex items-center hover:underline"
							>
								<FaArrowLeft className="mr-2" /> Back to Group
							</button>
						</div>

						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={handleSaveSettings}
							className="btn-primary flex items-center scale-75"
						>
							<FaSave className="mr-2" /> Save Changes
						</motion.button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				<h1 className="mb-4 !text-3xl md:!text-4xl font-bold">
					Group Settings
				</h1>

				{/* Status messages */}
				<AnimatePresence>
					{saveSuccess && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
							className="mb-6 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center"
						>
							<FaCheckCircle className="mr-2" /> Settings saved successfully!
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence>
					{saveError && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg flex items-center"
						>
							<FaExclamationTriangle className="mr-2" /> {saveError}
						</motion.div>
					)}
				</AnimatePresence>

				{/* Settings tabs */}
				<div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
					<button
						onClick={() => setActiveTab("general")}
						className={`px-4 py-2 font-medium text-sm border-b-2 ${
							activeTab === "general"
								? "border-primary text-primary dark:border-primary-light dark:text-primary-light"
								: "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
						}`}
					>
						General
					</button>
					<button
						onClick={() => setActiveTab("invite")}
						className={`px-4 py-2 font-medium text-sm border-b-2 ${
							activeTab === "invite"
								? "border-primary text-primary dark:border-primary-light dark:text-primary-light"
								: "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
						}`}
					>
						Invite & Share
					</button>
					<button
						onClick={() => setActiveTab("tags")}
						className={`px-4 py-2 font-medium text-sm border-b-2 ${
							activeTab === "tags"
								? "border-primary text-primary dark:border-primary-light dark:text-primary-light"
								: "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
						}`}
					>
						Tags
					</button>
				</div>

				{/* Tab content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Main content - 2/3 width on desktop */}
					<div className="lg:col-span-2 space-y-6">
						{activeTab === "general" && (
							<>
								<SettingsSection title="Basic Information" icon={<FaGlobe />}>
									<div className="space-y-4">
										<div>
											<label
												htmlFor="name"
												className="block text-sm font-medium mb-1 input-label"
											>
												Group Name
											</label>
											<input
												type="text"
												id="name"
												name="name"
												value={formState.name}
												onChange={handleInputChange}
												className="w-full input-modern"
												placeholder="Enter group name"
											/>
										</div>

										<div>
											<label
												htmlFor="description"
												className="block text-sm font-medium input-label"
											>
												Description
											</label>
											<TextareaAutosize
												id="description"
												name="description"
												value={formState.description}
												onChange={handleInputChange}
												className="textarea-modern"
												minRows={3}
												maxRows={9}
												placeholder="Enter group description"
											/>
										</div>
									</div>
								</SettingsSection>

								<SettingsSection title="Privacy Settings" icon={<FaLock />}>
									<div className="flex items-start">
										<div className="flex items-center h-5">
											<input
												id="isPublic"
												name="isPublic"
												type="checkbox"
												checked={formState.isPublic}
												onChange={handleToggleChange}
												className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
											/>
										</div>
										<div className="ml-3 text-sm">
											<label
												htmlFor="isPublic"
												className="font-medium text-gray-700 dark:text-gray-300"
											>
												Make this group public
											</label>
											<p className="text-gray-500 dark:text-gray-400">
												Public groups are discoverable by anyone. Private groups
												require an invite link.
											</p>
										</div>
									</div>
								</SettingsSection>

								<SettingsSection
									title="Danger Zone"
									icon={<FaExclamationTriangle className="text-red-500" />}
									className="border-red-200 dark:border-red-900/30"
								>
									<div className="space-y-4">
										{/* Change Password Option */}
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
											<div>
												<h4 className="font-medium mb-1">Change Password</h4>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													Change the admin password for this group. Make sure to
													remember it, as it is required for sensitive actions.
												</p>
											</div>
											<button
												onClick={handleChangePassword}
												className="px-4 py-2 bg-primary-light dark:bg-primary-dark rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary-lighter dark:hover:bg-primary-darker transition-colors flex items-center"
											>
												<FaKey className="mr-2" /> Change
											</button>
										</div>
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
											<div>
												<h4 className="font-medium mb-1">Delete Group</h4>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													Permanently delete this group and all its data. This
													action cannot be undone.
												</p>
											</div>
											<button
												onClick={() => setShowDeleteDialog(true)}
												className="px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-md text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors flex items-center"
											>
												<FaTrash className="mr-2" /> Delete
											</button>
										</div>
									</div>
								</SettingsSection>
							</>
						)}

						{activeTab === "invite" && (
							<>
								<SettingsSection title="Share Group" icon={<FaShareAlt />}>
									<div className="space-y-4">
										<div>
											<label htmlFor="link" className="input-label">
												Invite Link
											</label>
											{/* Copy Success Toast */}
											<AnimatePresence>
												{copySuccess && (
													<motion.div
														initial={{ opacity: 0, y: -10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														transition={{ duration: 0.3 }}
														className="mb-3 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center"
													>
														<FaCheckCircle className="mr-2" /> Copyed to
														Clipboard!
													</motion.div>
												)}
											</AnimatePresence>
											<div className="flex mb-3">
												{" "}
												<input
													type="text"
													id="link"
													name="link"
													readOnly
													value={generateInviteLink()}
													className="input-modern"
												/>
												<button
													onClick={handleCopyLink}
													className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
												>
													Copy
												</button>
											</div>
											<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
												Share this link with people you want to invite to your
												group.
											</p>
										</div>
									</div>
								</SettingsSection>

								<SettingsSection title="QR Code" icon={<FaQrcode />}>
									<div className="text-center">
										<QRCodeGenerator
											url={generateInviteLink()}
											size={200}
											groupName={group.name}
										/>
										<p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
											Scan this QR code to join the group directly from a mobile
											device.
										</p>
									</div>
								</SettingsSection>
							</>
						)}

						{activeTab === "tags" && (
							<SettingsSection title="Manage Tags" icon={<FaTags />}>
								<TagManager
									groupId={groupId}
									initialTags={group.tags || []}
									onTagsUpdate={(newTags) => {
										if (!group) return;

										const updatedGroup: Group = {
											...group,
											tags: newTags,
										};

										updateGroup(updatedGroup);
									}}
								/>
							</SettingsSection>
						)}
					</div>

					{/* Sidebar - 1/3 width on desktop */}
					<div className="lg:col-span-1 space-y-6">
						<SettingsSection title="Settings Help" icon={<FaQuestionCircle />}>
							<div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
								<div>
									<h4 className="text-md font-medium">Basic Information</h4>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Change your group name and description to help users
										understand the purpose.
									</p>
								</div>

								<div>
									<h4 className="font-medium">Privacy</h4>
									<p>
										Public groups can be discovered by all users. Private groups
										require direct links to join.
									</p>
								</div>

								<div>
									<h4 className="font-medium">Tags</h4>
									<p>
										Add tags to help categorize questions and make filtering
										easier.
									</p>
								</div>

								<div>
									<h4 className="font-medium">Sharing</h4>
									<p>
										Use the invite link or QR code to share your group with
										others.
									</p>
								</div>
							</div>
						</SettingsSection>

						<SettingsSection
							title="Group Stats"
							className="bg-gray-50 dark:bg-gray-800/50"
						>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Created
									</span>
									<span>{formatDate(group.createdAt)}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Questions
									</span>
									<span>{group.questionCount}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Last Updated
									</span>
									<span>{timeAgo(group.updatedAt)}</span>
								</div>
							</div>
						</SettingsSection>
					</div>
				</div>
			</div>

			{/* Confirmation dialogs */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDeleteGroup}
				title="Delete Group"
				message="Are you sure you want to delete this group? All questions, answers, and data will be permanently lost. This action cannot be undone."
				confirmText="Delete Group"
				confirmStyle="danger"
			/>
		</div>
	);
}

// Helper functions
function formatDate(dateString?: string): string {
	if (!dateString) return "Unknown";

	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}

function timeAgo(dateString?: string): string {
	if (!dateString) return "Unknown";

	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (seconds < 60) return "Just now";

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

	const days = Math.floor(hours / 24);
	if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

	const months = Math.floor(days / 30);
	if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

	const years = Math.floor(months / 12);
	return `${years} year${years > 1 ? "s" : ""} ago`;
}
