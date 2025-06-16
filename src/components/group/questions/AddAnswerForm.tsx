"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useAnswerStore } from "@/store/answerStore";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AiButton from "@/components/ui/AiButton";
import AIModal from "@/components/ui/AIModal";

// Define Zod schema for answer validation
const answerSchema = z.object({
	content: z
		.string()
		.min(10, "Answer must be at least 10 characters")
		.max(5000, "Answer cannot exceed 5000 characters"),
	authorPassword: z
		.string()
		.min(4, "Password must be at least 4 characters")
		.max(100, "Password cannot exceed 100 characters"),
	authorNickname: z
		.string()
		.max(50, "Nickname cannot exceed 50 characters")
		.optional(),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

type AddAnswerFormProps = {
	questionId: string;
	groupId?: string; // Optional prop to pass group ID for AI context
	questionContent?: string; // Optional prop to pass question content for AI context
};

export default function AddAnswerForm({
	questionId,
	questionContent,
	groupId,
}: Readonly<AddAnswerFormProps>) {
	const [isAiActive, setIsAiActive] = useState(false);
	const [isStreaming] = useState(false);
	const [showNicknameField, setShowNicknameField] = useState(false);
	const [isAIModalOpen, setIsAIModalOpen] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);

	const { addAnswer } = useAnswerStore();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<AnswerFormValues>({
		resolver: zodResolver(answerSchema),
		defaultValues: {
			content: "",
			authorPassword: "",
			authorNickname: "",
		},
	});

	const onSubmit = async (data: AnswerFormValues) => {
		try {
			await addAnswer({
				questionId,
				content: data.content.trim(),
				authorNickname: data.authorNickname?.trim() || "Anonymous",
				authorPassword: data.authorPassword,
				mediaIds: [], // Handle media uploads separately if needed
			});

			// Reset form after successful submission
			reset();
			setShowNicknameField(false);
		} catch (err) {
			console.error("Failed to submit answer:", err);
		}
	};

	const toggleAi = async () => {
		setIsAIModalOpen(true);
	};

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

	// Register the textarea with a ref so we can focus it
	const { ref, ...rest } = register("content");

	return (
		<motion.form
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			onSubmit={handleSubmit(onSubmit)}
			className=""
		>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-medium">Your Answer</h3>
				<AiButton
					isAiActive={isAiActive}
					isStreaming={isStreaming}
					toggleAi={toggleAi}
				/>
			</div>
			<div className="space-y-4">
				{/* Answer content textarea */}
				<div className="relative">
					<div
						className={`relative rounded-md overflow-hidden ${
							isAiActive || isStreaming ? "ai-textarea-container" : ""
						}`}
					>
						<TextareaAutosize
							id="answer"
							ref={(e) => {
								ref(e);
								textareaRef.current = e;
							}}
							{...rest}
							placeholder="Write your answer here..."
							minRows={5}
							maxRows={20}
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

				{/* Password input - Always visible */}
				<div>
					<label
						htmlFor="answerPassword"
						className="text-md text-gray-700 dark:text-gray-300"
					>
						Password:
					</label>
					<input
						type="password"
						id="answerPassword"
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

				{/* Toggle button for nickname field */}
				<button
					type="button"
					onClick={() => setShowNicknameField(!showNicknameField)}
					className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
				>
					{showNicknameField ? (
						<>
							<FaChevronUp className="text-xs" />
							Hide nickname option
						</>
					) : (
						<>
							<FaChevronDown className="text-xs" />
							Add nickname (optional)
						</>
					)}
				</button>

				{/* Nickname field with animation */}
				<AnimatePresence>
					{showNicknameField && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div>
								<label
									htmlFor="answerNickname"
									className="text-md text-gray-700 dark:text-gray-300"
								>
									Nickname:
								</label>
								<input
									type="text"
									id="answerNickname"
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
						</motion.div>
					)}
				</AnimatePresence>

				{/* Submit button */}
				<div className="mt-4 flex justify-end">
					{" "}
					<button
						type="submit"
						disabled={isSubmitting || isStreaming}
						className="btn-primary flex items-center justify-center gap-2 transition-colors"
					>
						<FaPaperPlane />
						{isSubmitting ? "Posting..." : "Post Answer"}
					</button>
				</div>
			</div>{" "}
			{/* AI Modal */}
			<AIModal
				isOpen={isAIModalOpen}
				onClose={() => setIsAIModalOpen(false)}
				precontent={questionContent || ""}
				onSelect={handleAIContentSelect}
				questionId={questionId}
				groupId={groupId}
			/>
		</motion.form>
	);
}
