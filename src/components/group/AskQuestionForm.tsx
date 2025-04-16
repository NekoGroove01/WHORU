"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaPaperPlane } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { nanoid } from "nanoid";
import { useQuestionStore } from "@/store/questionStore";
import { useGroupStore } from "@/store/groupStore";

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
	const { group } = useGroupStore();
	const { addQuestion } = useQuestionStore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<QuestionFormValues>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			title: "",
			content: "",
			tags: [],
		},
	});

	const onSubmit = async (data: QuestionFormValues) => {
		try {
			// In a real app, you would send this to your API
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Create new question with current data and selected tags
			const newQuestion = {
				id: nanoid(),
				groupId,
				title: data.title,
				content: data.content,
				tags: selectedTags,
				authorId: "current-user", // In real app, this would be the actual user ID
				authorName: "You (Anonymous)",
				upvotes: 0,
				downvotes: 0,
				answerCount: 0,
				isAnswered: false,
				createdAt: new Date().toISOString(),
			};

			// Add to local state
			addQuestion(newQuestion);

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
						className="text-sm text-gray-700 dark:text-gray-300 mb-2"
					>
						Title:
					</label>
					<input
						type="text"
						id="title"
						{...register("title")}
						placeholder="Title of your question..."
						{...register("title")}
						className={`input-modern ${errors.title ? "input-error" : ""}`}
					/>
					{errors.title && (
						<p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="question"
						className="text-sm text-gray-700 dark:text-gray-300 mb-2"
					>
						Question:
					</label>
				</div>
				<div>
					<TextareaAutosize
						id="question"
						{...register("content")}
						placeholder="Describe your question in detail..."
						{...register("content")}
						minRows={3}
						maxRows={15}
						className={`textarea-modern ${errors.content ? "input-error" : ""}`}
					/>
					{errors.content && (
						<p className="mt-1 text-sm text-red-500">
							{errors.content.message}
						</p>
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
						disabled={isSubmitting}
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
