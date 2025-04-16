"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaPaperPlane } from "react-icons/fa";
import { useAnswerStore } from "@/store/answerStore";
import TextareaAutosize from "react-textarea-autosize";

type AddAnswerFormProps = {
	questionId: string;
};

export default function AddAnswerForm({
	questionId,
}: Readonly<AddAnswerFormProps>) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { addAnswer } = useAnswerStore();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!content.trim()) {
			setError("Answer cannot be empty");
			return;
		}

		try {
			setIsSubmitting(true);
			setError(null);

			await addAnswer({
				questionId,
				content: content.trim(),
				authorId: "current-user", // In a real app, this would be the actual user ID
				authorName: "You (Anonymous)",
				upvotes: 0,
				downvotes: 0,
				isAccepted: false,
			});

			// Reset form after successful submission
			setContent("");
			setIsSubmitting(false);
		} catch (err) {
			console.error("Failed to submit answer:", err);
			setError("Failed to submit your answer. Please try again.");
			setIsSubmitting(false);
		}
	};

	return (
		<motion.form
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			onSubmit={handleSubmit}
			className=""
		>
			<TextareaAutosize
				value={content}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					setContent(e.target.value)
				}
				placeholder="Write your answer here..."
				minRows={4}
				maxRows={20}
				className="textarea-modern"
			/>

			<div className="mt-4 flex justify-end">
				<button
					type="submit"
					disabled={isSubmitting || !content.trim()}
					className="btn-primary flex items-center justify-center gap-2"
				>
					<FaPaperPlane />
					{isSubmitting ? "Posting..." : "Post Answer"}
				</button>
			</div>
		</motion.form>
	);
}
