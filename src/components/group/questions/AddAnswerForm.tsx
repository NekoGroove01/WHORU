"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { useAnswerStore } from "@/store/answerStore";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AIButton from "@/components/ui/AIButton";

// Define Zod schema for answer validation
const answerSchema = z.object({
	content: z
		.string()
		.min(10, "Answer must be at least 10 characters")
		.max(5000, "Answer cannot exceed 5000 characters"),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

type AddAnswerFormProps = {
	questionId: string;
	questionTitle?: string; // Optional prop to pass question title for AI context
	questionContent?: string; // Optional prop to pass question content for AI context
};

export default function AddAnswerForm({
	questionId,
	questionTitle = "",
	questionContent = "",
}: Readonly<AddAnswerFormProps>) {
	const [isAiActive, setIsAiActive] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { addAnswer } = useAnswerStore();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<AnswerFormValues>({
		resolver: zodResolver(answerSchema),
		defaultValues: {
			content: "",
		},
	});

	const currentContent = watch("content");

	const onSubmit = async (data: AnswerFormValues) => {
		try {
			await addAnswer({
				questionId,
				content: data.content.trim(),
				authorId: "current-user", // In a real app, this would be the actual user ID
				authorName: "You (Anonymous)",
				upvotes: 0,
				downvotes: 0,
				isAccepted: false,
			});

			// Reset form after successful submission
			reset();
		} catch (err) {
			console.error("Failed to submit answer:", err);
		}
	};

	const toggleAi = async () => {
		setIsAiActive((prev) => !prev);

		if (!isAiActive && !isStreaming) {
			// Simulate AI generating content
			setIsStreaming(true);

			// Example AI generated content - would come from an API in a real app
			const aiContent =
				"I'm trying to understand how to implement a recursive algorithm for traversing a binary tree. Can someone explain the best approach and possible edge cases I should consider?";

			let currentText = currentContent;

			// Simulate streaming effect
			for (let i = 0; i < aiContent.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 15)); // Control streaming speed
				currentText += aiContent.charAt(i);
				// Update the textarea with the current text
				setValue("content", currentText, { shouldValidate: true });
			}

			setIsStreaming(false);
		}
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
			<div className="flex justify-between items-center mb-2">
				<h3 className="text-lg font-medium mb-4">Your Answer</h3>
				<AIButton isAiActive isStreaming toggleAi={toggleAi} />
			</div>

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
					<p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
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

			<div className="mt-4 flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting || isStreaming}
					className="btn-primary flex items-center justify-center gap-2"
				>
					<FaPaperPlane />
					{isSubmitting ? "Posting..." : "Post Answer"}
				</button>
			</div>
		</motion.form>
	);
}
