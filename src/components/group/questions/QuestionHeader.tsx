"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaHeart,
	FaRegHeart,
	FaClock,
	FaEdit,
	FaSave,
	FaTimes,
} from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { Question } from "@/types/question";
import { useQuestionStore } from "@/store/questionStore";
import { formatDistanceToNow } from "@/utils/dateUtils";
import { useInputModal } from "@/hooks/useInputModal";

type QuestionHeaderProps = {
	question: Question;
};

export default function QuestionHeader({
	question,
}: Readonly<QuestionHeaderProps>) {
	const [hasVoted, setHasVoted] = useState<boolean>(false);
	const [isEditing, setIsEditing] = useState<boolean>(false);

	// States for editing
	const [editedTitle, setEditedTitle] = useState(question.title || "");
	const [editedContent, setEditedContent] = useState(question.content);
	const [editedTags, setEditedTags] = useState<string[]>(question.tags || []);

	const { updateQuestion, upvoteQuestion } = useQuestionStore();
	const { getInputWithAsyncHandler } = useInputModal();

	// Update local state when question prop changes
	useEffect(() => {
		setEditedTitle(question.title || "");
		setEditedContent(question.content);
		setEditedTags(question.tags || []);
	}, [question]);

	const handleVote = () => {
		if (hasVoted) return;

		upvoteQuestion(question.id);
		setHasVoted(true);
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		// Reset to original values
		setEditedTitle(question.title || "");
		setEditedContent(question.content);
		setEditedTags(question.tags || []);
		setIsEditing(false);
	};

	const handleSave = () => {
		// Validate before saving
		if (editedContent.trim().length < 3) {
			alert("Question must be at least 3 characters");
			return;
		}

		// Show password input modal
		getInputWithAsyncHandler(
			{
				title: "Verify Your Identity",
				message: "Enter your password to save changes",
				inputLabel: "Password",
				inputPlaceholder: "Enter the password you used when posting...",
				inputType: "password",
				validation: (value) => {
					if (!value.trim()) return "Password is required";
					if (value.length < 4) return "Password must be at least 4 characters";
					return null;
				},
				submitLabel: "Save Changes",
			},
			async (password) => {
				try {
					const response = await updateQuestion(
						{
							id: question.id,
							title: editedTitle,
							content: editedContent,
							tags: editedTags,
						},
						password
					);

					if (!response.success) {
						throw new Error(response.error || "Update failed");
					}
					// Exit edit mode on success
					setIsEditing(false);
				} catch (error) {
					console.error("Failed to update question:", error);
					throw new Error("Invalid password or update failed");
				}
			}
		);
	};

	const toggleTag = (tag: string) => {
		setEditedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	return (
		<div className="mb-6">
			<AnimatePresence mode="wait">
				{!isEditing ? (
					// Normal view mode
					<motion.div
						key="view-mode"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex flex-col md:flex-row justify-between items-start gap-4"
					>
						{/* Title and metadata */}
						<div className="flex-1">
							<h1 className="!text-3xl md:!text-4xl font-bold text-gray-900 dark:text-white mb-3">
								{question.title || "Untitled Question"}
							</h1>

							<div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
								<div className="flex items-center">
									<FaClock className="mr-1.5" />
									<span>
										Asked {formatDistanceToNow(new Date(question.createdAt))}{" "}
										ago
									</span>
								</div>

								<div>
									<span>By {question.authorNickname}</span>
								</div>

								<div>
									<span>{question.answerCount} answers</span>
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-3">
							{/* Like button */}
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={handleVote}
								className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
									hasVoted
										? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
										: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
								}`}
								aria-label="Like question"
							>
								<motion.div
									key={`heart-${hasVoted}`}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 15 }}
								>
									{hasVoted ? (
										<FaHeart className="text-red-500" />
									) : (
										<FaRegHeart />
									)}
								</motion.div>
								<motion.span
									className="font-medium"
									key={`vote-${question.upvotes}`}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									{question.upvotes}
								</motion.span>
							</motion.button>

							{/* Edit button */}
							<motion.button
								whileTap={{ scale: 0.95 }}
								onClick={handleEdit}
								className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
								aria-label="Edit question"
							>
								<FaEdit />
								<span className="font-medium">Edit</span>
							</motion.button>
						</div>
					</motion.div>
				) : (
					// Edit mode
					<motion.div
						key="edit-mode"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="space-y-4"
					>
						{/* Title input */}
						<div>
							<p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Title (optional)
							</p>
							<input
								type="text"
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								placeholder="Enter question title..."
								className="input-modern w-full"
								maxLength={200}
							/>
						</div>

						{/* Content textarea */}
						<div>
							<p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Question Content *
							</p>
							<TextareaAutosize
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								placeholder="Describe your question in detail..."
								minRows={3}
								maxRows={15}
								className="textarea-modern w-full"
								maxLength={1000}
							/>
							<p className="mt-1 text-xs text-gray-500">
								{editedContent.length}/1000 characters
							</p>
						</div>

						{/* Tags */}
						{question.tags && question.tags.length > 0 && (
							<div>
								<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Tags
								</p>
								<div className="flex flex-wrap gap-2">
									{question.tags.map((tag) => (
										<button
											key={tag}
											type="button"
											onClick={() => toggleTag(tag)}
											className={`px-3 py-1 rounded-full text-sm transition-all ${
												editedTags.includes(tag)
													? "bg-primary text-white"
													: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
											}`}
										>
											{tag}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Action buttons */}
						<div className="flex items-center gap-3 pt-4">
							<button
								onClick={handleSave}
								className="btn-primary flex items-center gap-2 px-6"
							>
								<FaSave />
								Save Changes
							</button>
							<button
								onClick={handleCancel}
								className="btn-secondary flex items-center gap-2 px-6"
							>
								<FaTimes />
								Cancel
							</button>
						</div>

						{/* Metadata in edit mode */}
						<div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2 pt-2">
							<div className="flex items-center">
								<FaClock className="mr-1.5" />
								<span>
									Asked {formatDistanceToNow(new Date(question.createdAt))} ago
								</span>
							</div>
							<div>
								<span>By {question.authorNickname}</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
