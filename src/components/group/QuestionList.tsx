"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/types/question";
import QuestionCard from "./QestionCard";

type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionListProps = {
	questions: Question[];
	activeTab: Tab;
	selectedTags: string[];
};

export default function QuestionList({
	questions,
	activeTab,
	selectedTags,
}: Readonly<QuestionListProps>) {
	const filteredQuestions = useMemo(() => {
		// First, filter by tags if any are selected
		const filtered =
			selectedTags.length > 0
				? questions.filter((q) =>
						q.tags.some((tag) => selectedTags.includes(tag))
				  )
				: questions;

		// Then, filter by the active tab
		switch (activeTab) {
			case "popular":
				return filtered.sort((a, b) => b.upvotes - a.upvotes);
			case "recent":
				return filtered.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			case "mine":
				return filtered.filter((q) => q.authorId === "current-user");
			case "unanswered":
				return filtered.filter((q) => !q.isAnswered);
			default:
				return filtered;
		}
	}, [questions, activeTab, selectedTags]);

	if (filteredQuestions.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-4 text-center"
			>
				<p className="text-gray-500 dark:text-gray-400">
					No questions found. Be the first to ask something!
				</p>
			</motion.div>
		);
	}

	return (
		<div className="mt-4 space-y-4">
			<AnimatePresence initial={false}>
				{filteredQuestions.map((question) => (
					<motion.div
						key={question.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
					>
						<QuestionCard question={question} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
