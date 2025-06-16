"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaClock,
	FaCheck,
	FaHeart,
	FaRegHeart,
	FaEdit,
	FaSave,
	FaTimes,
} from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { Answer } from "@/types/answer";
import { useAnswerStore } from "@/store/answerStore";
import { formatDistanceToNow } from "@/utils/dateUtils";
import { useInputModal } from "@/hooks/useInputModal";
import { useModalStore } from "@/store/modalStore";

type AnswerItemProps = {
	answer: Answer;
	isQuestionAuthor: boolean;
	questionId: string;
};

export default function AnswerItem({
	answer,
	isQuestionAuthor,
	questionId,
}: Readonly<AnswerItemProps>) {
	const [hasVoted, setHasVoted] = useState<boolean>(false);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editContent, setEditContent] = useState<string>(answer.content);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { upvoteAnswerAPI, acceptAnswerAPI, updateAnswer } = useAnswerStore();
	const { getInputWithAsyncHandler } = useInputModal();
	const { showError, showSuccess } = useModalStore();

	const handleVote = async () => {
		if (hasVoted) {
			return;
		}

		try {
			const result = await upvoteAnswerAPI(answer.id);
			if (result.success) {
				setHasVoted(true);
				// The real-time update will be handled by Socket.IO
			} else {
				showError("Vote Error", result.error || "Failed to vote");
			}
		} catch (error) {
			console.error("Failed to vote:", error);
			showError("Vote Error", "Failed to vote on answer");
		}
	};

	const handleAccept = async () => {
		if (!isQuestionAuthor) {
			return;
		}

		getInputWithAsyncHandler(
			{
				title: "Question Author Password",
				message: "Enter your password to accept this answer:",
				inputType: "password",
				inputPlaceholder: "Enter password",
				validation: (value: string) => {
					if (!value || value.length < 6) {
						return "Password must be at least 6 characters";
					}
					return null;
				},
			},
			async (value: string) => {
				const result = await acceptAnswerAPI(answer.id, questionId, value);
				if (result.success) {
					showSuccess("Success", "Answer accepted successfully!");
					// The real-time update will be handled by Socket.IO
				} else {
					showError("Accept Error", result.error || "Failed to accept answer");
				}
			}
		);
	};

	const handleEdit = () => {
		setIsEditing(true);
		setEditContent(answer.content);
		// Focus textarea after state update
		setTimeout(() => {
			textareaRef.current?.focus();
			textareaRef.current?.setSelectionRange(
				textareaRef.current.value.length,
				textareaRef.current.value.length
			);
		}, 0);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditContent(answer.content);
	};

	const handleSaveEdit = async () => {
		// Validate content
		if (!editContent.trim()) {
			showError("Validation Error", "Answer cannot be empty");
			return;
		}

		if (editContent.trim() === answer.content.trim()) {
			setIsEditing(false);
			return;
		}
		getInputWithAsyncHandler(
			{
				title: "Confirm Edit",
				message: "Enter your password to update this answer",
				inputPlaceholder: "Enter the password you used when posting...",
				inputType: "password",
				validation: (value: string) => {
					if (!value.trim()) return "Password is required";
					if (value.length < 4) return "Password must be at least 4 characters";
					return null;
				},
			},
			async (password: string) => {
				if (!password) {
					showError("Validation Error", "Password is required");
					return;
				}

				setIsSubmitting(true);
				const result = await updateAnswer(
					answer.id,
					editContent.trim(),
					password
				);

				if (!result.success) {
					throw new Error(
						result.error || "Failed to update answer. Please try again."
					);
				}

				setIsEditing(false);
				// The real-time update will be handled by Socket.IO
			}
		);

		setIsSubmitting(false);
	};

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
				answer.isAccepted
					? "border-green-200 dark:border-green-800"
					: "border-gray-200 dark:border-gray-700"
			}`}
		>
			{/* Accepted banner */}
			{answer.isAccepted && (
				<div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-t-lg flex items-center">
					<FaCheck className="mr-2" />
					<span className="font-medium">Accepted Answer</span>
				</div>
			)}

			<div className="p-6">
				{/* Answer content or edit form */}
				<AnimatePresence mode="wait">
					{isEditing ? (
						<motion.div
							key="edit-form"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="mb-4"
						>
							<TextareaAutosize
								ref={textareaRef}
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								minRows={3}
								maxRows={15}
								disabled={isSubmitting}
								className="textarea-modern w-full"
								placeholder="Enter your answer..."
								style={{ letterSpacing: "-0.025em" }}
							/>
							<div className="flex gap-2 mt-3">
								<button
									onClick={handleSaveEdit}
									disabled={isSubmitting || !editContent.trim()}
									className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
								>
									<FaSave />
									Save
								</button>
								<button
									onClick={handleCancelEdit}
									disabled={isSubmitting}
									className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
								>
									<FaTimes />
									Cancel
								</button>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="content"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="prose dark:prose-invert prose-blue max-w-none mb-4"
						>
							<p
								className="whitespace-pre-line"
								style={{ letterSpacing: "-0.025em" }}
							>
								{answer.content}
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Bottom section with author info and actions */}
				<div className="flex justify-between items-center">
					{/* Left side - Author and time */}
					<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
						<span className="font-medium">{answer.authorNickname}</span>
						<div className="flex items-center">
							<FaClock className="mr-1" />
							<span>{formatDistanceToNow(new Date(answer.createdAt))} ago</span>
						</div>
						{answer.updatedAt && answer.updatedAt !== answer.createdAt && (
							<span className="text-xs">(edited)</span>
						)}
					</div>

					{/* Right side - Actions */}
					<div className="flex items-center gap-2">
						{/* Edit button */}
						{!isEditing && (
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={handleEdit}
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
								aria-label="Edit answer"
							>
								<FaEdit className="text-sm" />
								<span className="font-medium text-sm">Edit</span>
							</motion.button>
						)}

						{/* Like button */}
						{!isEditing && (
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={handleVote}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
									hasVoted
										? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
								aria-label="Like answer"
							>
								<motion.div
									key={`heart-${hasVoted}`}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 15 }}
								>
									{hasVoted ? (
										<FaHeart className="text-red-500 text-sm" />
									) : (
										<FaRegHeart className="text-sm" />
									)}
								</motion.div>
								<motion.span
									className="font-medium text-sm"
									key={`vote-${answer.upvotes}`}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									{answer.upvotes}
								</motion.span>
							</motion.button>
						)}

						{/* Accept button */}
						{isQuestionAuthor && !answer.isAccepted && !isEditing && (
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={handleAccept}
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30 transition-all"
								title="Accept this answer"
							>
								<FaCheck className="text-sm" />
								<span className="font-medium text-sm">Accept</span>
							</motion.button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
