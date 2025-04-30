"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { useAnswerStore } from "@/store/answerStore";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AiButton from "@/components/ui/AiButton";
import fetchGeminiResponse from "@/utils/geminiAPI";

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
	answerContent?: string; // Optional prop to pass question content for AI context
};

export default function AddAnswerForm({
	questionId,
	questionTitle = "",
	answerContent: questionContent = "",
}: Readonly<AddAnswerFormProps>) {
	const [isAiActive, setIsAiActive] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

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
		// If currently streaming, abort it
		if (isStreaming) {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
				abortControllerRef.current = null;
			}
			setIsStreaming(false);
			return;
		}

		setIsAiActive((prev) => !prev);

		if (!isAiActive) {
			try {
				setIsStreaming(true);

				// Create a new AbortController for this request
				abortControllerRef.current = new AbortController();

				// Get the current content
				const currentTextContent = watch("content");

				// Start with the current content if any
				let streamedContent = currentTextContent;

				// Call the API with streaming callback and pass the abort signal
				await fetchGeminiResponse(
					questionTitle || "Question",
					(questionContent || "") +
						(currentTextContent
							? `\n\nCurrent draft: ${currentTextContent}`
							: ""),
					0, // Using prompt type 1 for answer generation
					(chunkText: string) => {
						streamedContent += chunkText;
						setValue("content", streamedContent, { shouldValidate: true });
					},
					abortControllerRef.current.signal // Pass the abort signal
				);
			} catch (error: unknown) {
				// Check if the error is an abort error
				if (error instanceof Error && error.name !== "AbortError") {
					console.error("Error with AI generation:", error);
				}
			} finally {
				setIsStreaming(false);
				abortControllerRef.current = null;
			}
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
