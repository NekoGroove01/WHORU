"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaPaperPlane } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { nanoid } from "nanoid";
import { useQuestionStore } from "@/store/questionStore";
import { useGroupStore } from "@/store/groupStore";
import AiButton from "../ui/AiButton";
import fetchGeminiResponse from "@/utils/geminiService";

type AskQuestionFormProps = {
	groupId: string;
};

const questionSchema = z.object({
	title: z
		.string()
		.min(5, "Title must be at least 5 characters")
		.max(200, "Title cannot exceed 200 characters"),
	content: z
		.string()
		.min(10, "Question must be at least 10 characters")
		.max(1000, "Question cannot exceed 1000 characters"),
	tags: z.array(z.string()).optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function AskQuestionForm({
	groupId,
}: Readonly<AskQuestionFormProps>) {
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [isAiActive, setIsAiActive] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { group } = useGroupStore();
	const { addQuestion } = useQuestionStore();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<QuestionFormValues>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			title: "",
			content: "",
			tags: [],
		},
	});

	const abortControllerRef = useRef<AbortController | null>(null);

	const onSubmit = async (data: QuestionFormValues) => {
		try {
			// In a real app, you would send this to your API
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Create new question with current data and selected tags
			const newQuestion = {
				groupId,
				title: data.title,
				content: data.content,
				authorNickname: "Anonymous",
				tags: selectedTags,
				answerCount: 0,
				isAnswered: false,
				isResolvedByAsker: false,
				upvotes: 0,
				views: 0,
			};

			// Add to local state
			await addQuestion(newQuestion);

			// Reset form after successful submission
			reset();
			setSelectedTags([]);
		} catch (error) {
			console.error("Failed to submit question:", error);
		}
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
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

				console.log(`Streaming AI response... ${streamedContent}`);

				// Call the API with streaming callback and pass the abort signal
				await fetchGeminiResponse(
					group
						? `${group?.name}: ${group?.description}`
						: "No topic, please generate any question",
					currentTextContent ?? "",
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
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
		>
			<h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
				Ask a Question
			</h3>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
						<p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
					)}
				</div>

				<div>
					<div className="flex justify-between items-center">
						<label
							htmlFor="question"
							className="text-md text-gray-700 dark:text-gray-300 mb-2"
						>
							Question:
						</label>
						<AiButton
							isAiActive={isAiActive}
							isStreaming={isStreaming}
							toggleAi={toggleAi}
						/>
					</div>
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
									rotate: [0, 360], // Added rotation animation
									scale: [1, 1.05, 1], // Subtle pulse
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

				{group?.tags && group.tags.length > 0 && (
					<div>
						<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
							Select tags (optional):
						</p>
						<div className="flex flex-wrap gap-2">
							{group.tags.map((tag) => (
								<button
									key={tag}
									type="button"
									onClick={() => toggleTag(tag)}
									className={`px-3 py-1 rounded-full text-sm ${
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
		</motion.div>
	);
}
