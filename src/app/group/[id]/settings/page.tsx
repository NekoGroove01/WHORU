"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
	FaArchive,
	FaQrcode,
	FaQuestionCircle,
} from "react-icons/fa";
import { useGroupStore } from "@/store/groupStore";
import SettingsSection from "@/components/group/settings/SettingsSection";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import LoadingUI from "@/components/ui/LoadingUI";
import QRCodeGenerator from "@/components/group/settings/QRCodeGenerator";
import TagManager from "@/components/group/settings/TagManager";
import { Group } from "@/types/group";
import TextareaAutosize from "react-textarea-autosize";

export default function GroupSettingsPage() {
	const params = useParams();
	const router = useRouter();
	const groupId: string = (params?.id as string) ?? "";

	const [isLoading, setIsLoading] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showArchiveDialog, setShowArchiveDialog] = useState(false);
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

	// Load group data
	useEffect(() => {
		const loadGroup = async () => {
			setIsLoading(true);
			try {
				await fetchGroup(groupId);
			} catch (error) {
				console.error("Error loading group:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadGroup();
	}, [groupId, fetchGroup]);

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

			// Create updated group object
			const updatedGroup: Group = {
				...group,
				name: formState.name,
				description: formState.description,
				isPublic: formState.isPublic,
			};

			// In a real app, this would call an API
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Update group in store
			await updateGroup(updatedGroup);

			// Show success message
			setSaveSuccess(true);
			setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving settings:", error);
			setSaveError("Failed to save settings. Please try again.");
		}
	};

	// Handle copy link
	const handleCopyLink = () => {
		navigator.clipboard.writeText(`${window.location.origin}/group/${groupId}`);
		setCopySuccess(true);
		setTimeout(() => setCopySuccess(false), 8000);
	};

	// Handle delete/archive
	const handleDeleteGroup = async () => {
		try {
			await deleteGroup(groupId);
			router.push("/");
		} catch (error) {
			console.error("Error deleting group:", error);
			setSaveError("Failed to delete group. Please try again.");
		}
	};

	const handleArchiveGroup = async () => {
		if (!group) return;

		try {
			const updatedGroup: Group = {
				...group,
				isActive: false,
			};

			await updateGroup(updatedGroup);
			router.push("/");
		} catch (error) {
			console.error("Error archiving group:", error);
			setSaveError("Failed to archive group. Please try again.");
		}
	};

	if (isLoading) {
		return <LoadingUI fullscreen text="Loading settings..." />;
	}

	if (!group) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Group not found</h1>
					<Link href="/" className="btn-primary">
						Go to Home
					</Link>
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
							<Link
								href={`/group/${groupId}`}
								className="text-primary dark:text-primary-light flex items-center hover:underline"
							>
								<FaArrowLeft className="mr-2" /> Back to Group
							</Link>
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
				<h1 className="my-4 !text-3xl md:!text-4xl font-bold">
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
										<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
											<div>
												<h4 className="font-medium mb-1">Archive Group</h4>
												<p className="text-sm text-gray-500 dark:text-gray-400">
													The group will be hidden but data will be preserved.
												</p>
											</div>
											<button
												onClick={() => setShowArchiveDialog(true)}
												className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
											>
												<FaArchive className="mr-2" /> Archive
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
												<input
													type="text"
													id="link"
													name="link"
													readOnly
													value={`${window.location.origin}/group/${groupId}`}
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
											url={`${window.location.origin}/group/${groupId}`}
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
									<h4 className="font-medium">Basic Information</h4>
									<p>
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
										Members
									</span>
									<span>{group.memberCount}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Questions
									</span>
									<span>{group.questionCount}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Last Activity
									</span>
									<span>{timeAgo(group.lastActivity)}</span>
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

			<ConfirmDialog
				isOpen={showArchiveDialog}
				onClose={() => setShowArchiveDialog(false)}
				onConfirm={handleArchiveGroup}
				title="Archive Group"
				message="Are you sure you want to archive this group? The group will be hidden from public view, but all data will be preserved."
				confirmText="Archive Group"
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
