"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { useQuestionStore } from "@/store/questionStore";
import { useGroupStore } from "@/store/groupStore";
import AiButton from "@/components/ui/AIButton";
import AIModal from "@/components/ui/AIModal";
import { useModalStore } from "@/store/modalStore";

type AskQuestionFormProps = {
	groupId: string;
};

const questionSchema = z.object({
	title: z.string().max(200, "Title cannot exceed 200 characters").optional(),
	content: z
		.string()
		.min(3, "Question must be at least 3 characters")
		.max(1000, "Question cannot exceed 1000 characters"),
	authorNickname: z
		.string()
		.max(50, "Nickname cannot exceed 50 characters")
		.optional(),
	authorPassword: z
		.string()
		.min(4, "Password must be at least 4 characters")
		.max(100, "Password cannot exceed 100 characters"),
	tags: z.array(z.string()).optional(),
	mediaIds: z.array(z.string()).optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function AskQuestionForm({
	groupId,
}: Readonly<AskQuestionFormProps>) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [isAiActive, setIsAiActive] = useState(false);
	const [isStreaming] = useState(false);
	const [showOptionalFields, setShowOptionalFields] = useState(false);
	const [isAIModalOpen, setIsAIModalOpen] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { group } = useGroupStore();
	const { addQuestion } = useQuestionStore();

	// Modal store for displaying messages
	const { showError, showSuccess } = useModalStore();

	const {
		register,
		handleSubmit,
		reset,
		setValue, // Add setValue from react-hook-form
		formState: { errors, isSubmitting },
	} = useForm<QuestionFormValues>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			title: "",
			content: "",
			tags: [],
		},
	});

	// Handle AI content selection
	const handleAIContentSelect = (content: string) => {
		// Set the content value in the form
		setValue("content", content, {
			shouldValidate: true, // Validate the new content
			shouldDirty: true, // Mark the field as dirty
			shouldTouch: true, // Mark the field as touched
		});

		// Close the modal
		setIsAIModalOpen(false);

		// Optional: Focus the textarea after setting the value
		setTimeout(() => {
			if (textareaRef.current) {
				textareaRef.current.focus();
				// Move cursor to the end of the text
				textareaRef.current.setSelectionRange(content.length, content.length);
			}
		}, 100);

		// Show a brief AI active animation
		setIsAiActive(true);
		setTimeout(() => setIsAiActive(false), 2000);
	};

	const onSubmit = async (data: QuestionFormValues) => {
		try {
			// Prepare question data
			const questionData = {
				...data,
				groupId,
				tags: selectedTags, // Use selected tags from state
				authorNickname: data.authorNickname || "Anonymous",
				title: data.title || "",
				answerCount: 0,
				isAnswered: false,
				upvotes: 0,
				views: 0,
			};

			// Add question via store (which calls the API)
			await addQuestion(questionData);

			// Show success message
			showSuccess("Success", "Your question has been posted successfully!");

			// Reset form after successful submission
			reset();
			setSelectedTags([]);
			setShowOptionalFields(false);
		} catch (error) {
			console.error("Failed to submit question:", error);
			showError("Error", "Failed to submit your question. Please try again.");
		}
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	const toggleAi = async () => {
		setIsAIModalOpen(true);
	};

	// Register the textarea with a ref so we can focus it
	const { ref, ...rest } = register("content");

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
		>
			<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
				Ask a Question
			</h3>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				{/* Main question input */}
				<div>
					<div className="flex justify-between items-center mb-2">
						<label
							htmlFor="question"
							className="text-md text-gray-700 dark:text-gray-300"
						>
							Question:
						</label>
						<AiButton
							isAiActive={isAiActive}
							isStreaming={isStreaming}
							toggleAi={toggleAi}
						/>
					</div>
					<div className="relative">
						<div
							className={`relative rounded-md overflow-hidden ${
								isAiActive || isStreaming ? "ai-textarea-container" : ""
							}`}
						>
							<TextareaAutosize
								id="question"
								ref={(e) => {
									ref(e);
									textareaRef.current = e;
								}}
								{...rest}
								placeholder="Describe your question in detail..."
								minRows={3}
								maxRows={15}
								className={`textarea-modern w-full relative z-10 ${
									errors.content ? "input-error" : ""
								} ${isAiActive || isStreaming ? "ai-textarea-active" : ""}`}
								onBlur={() => setIsAiActive(false)}
							/>

							{(isAiActive || isStreaming) && (
								<motion.div
									className="absolute inset-0 textarea-animated-bg"
									animate={{
										rotate: [0, 360],
										scale: [1, 1.05, 1],
									}}
									transition={{
										backgroundPosition: {
											repeat: Infinity,
											duration: 10,
											ease: "linear",
											repeatType: "mirror",
										},
									}}
								/>
							)}
						</div>

						{errors.content && (
							<p className="mt-1 text-sm text-red-500">
								{errors.content.message}
							</p>
						)}

						{isStreaming && (
							<motion.div
								className="absolute bottom-3 right-3 z-20"
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									repeat: Infinity,
									duration: 1.5,
								}}
							>
								<div className="h-3 w-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
							</motion.div>
						)}
					</div>
				</div>

				{/* Password input - Always visible */}
				<div>
					<label
						htmlFor="authorPassword"
						className="text-md text-gray-700 dark:text-gray-300"
					>
						Password:
					</label>
					<input
						type="password"
						id="authorPassword"
						{...register("authorPassword")}
						placeholder="Enter password to edit/delete later..."
						className={`input-modern w-full mt-2 ${
							errors.authorPassword ? "input-error" : ""
						}`}
					/>
					{errors.authorPassword && (
						<p className="mt-1 text-sm text-red-500">
							{errors.authorPassword.message}
						</p>
					)}
				</div>

				{/* Toggle button for optional fields */}
				<button
					type="button"
					onClick={() => setShowOptionalFields(!showOptionalFields)}
					className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
				>
					{showOptionalFields ? (
						<>
							<FaChevronUp className="text-xs" />
							Hide additional options
						</>
					) : (
						<>
							<FaChevronDown className="text-xs" />
							Show additional options
						</>
					)}
				</button>

				{/* Optional fields with animation */}
				<AnimatePresence>
					{showOptionalFields && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="space-y-4 overflow-hidden"
						>
							{/* Title input */}
							<div>
								<label
									htmlFor="title"
									className="text-md text-gray-700 dark:text-gray-300"
								>
									Title:
								</label>
								<div
									className={`relative rounded-md overflow-hidden mt-2 ${
										isAiActive || isStreaming ? "ai-input-container" : ""
									}`}
								>
									<input
										type="text"
										id="title"
										{...register("title")}
										placeholder="Title of your question..."
										className={`input-modern w-full relative z-10 ${
											errors.title ? "input-error" : ""
										} ${isAiActive || isStreaming ? "ai-input-active" : ""}`}
										onBlur={() => setIsAiActive(false)}
									/>

									{(isAiActive || isStreaming) && (
										<motion.div
											className="absolute inset-0 input-animated-bg"
											animate={{
												rotate: [0, 360],
												scale: [1, 1.05, 1],
											}}
											transition={{
												rotate: {
													repeat: Infinity,
													duration: 15,
													ease: "linear",
												},
												scale: {
													repeat: Infinity,
													duration: 3,
													ease: "easeInOut",
												},
											}}
										/>
									)}
								</div>
								{errors.title && (
									<p className="mt-1 text-sm text-red-500">
										{errors.title.message}
									</p>
								)}
							</div>

							{/* Nickname input */}
							<div>
								<label
									htmlFor="authorNickname"
									className="text-md text-gray-700 dark:text-gray-300"
								>
									Nickname:
								</label>
								<input
									type="text"
									id="authorNickname"
									{...register("authorNickname")}
									placeholder="Enter your nickname (default: Anonymous)..."
									className={`input-modern w-full mt-2 ${
										errors.authorNickname ? "input-error" : ""
									}`}
								/>
								{errors.authorNickname && (
									<p className="mt-1 text-sm text-red-500">
										{errors.authorNickname.message}
									</p>
								)}
							</div>

							{/* Tags */}
							{group?.tags && group.tags.length > 0 && (
								<div>
									<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
										Select tags:
									</p>
									<div className="flex flex-wrap gap-2">
										{group.tags.map((tag) => (
											<button
												key={tag}
												type="button"
												onClick={() => toggleTag(tag)}
												className={`px-3 py-1 rounded-full text-sm transition-all ${
													selectedTags.includes(tag)
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
						</motion.div>
					)}
				</AnimatePresence>

				<div className="pt-2">
					<button
						type="submit"
						disabled={isSubmitting || isStreaming}
						className="w-full btn-primary flex items-center justify-center gap-2"
					>
						<FaPaperPlane />
						{isSubmitting ? "Posting..." : "Post Question"}
					</button>
				</div>
			</form>

			{/* AI Modal with onSelect callback */}
			<AIModal
				isOpen={isAIModalOpen}
				onClose={() => setIsAIModalOpen(false)}
				onSelect={handleAIContentSelect}
				precontent={group?.name || ""}
				groupId={groupId}
			/>
		</motion.div>
	);
}
