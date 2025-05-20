"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Answer } from "@/types/answer";
import AnswerItem from "./AnswerItem";

type AnswerListProps = {
	answers: Answer[];
};

type SortOption = "newest" | "votes" | "oldest";

function AnswerList({ answers }: Readonly<AnswerListProps>) {
	const [sortBy, setSortBy] = useState<SortOption>("votes");
	const [sortedAnswers, setSortedAnswers] = useState<Answer[]>(answers);
	// Add this to track initial mount
	const initialRenderComplete = useRef(false);

	useEffect(() => {
		// Set flag after initial render
		initialRenderComplete.current = true;
		const newSortedAnswers = [...answers].sort((a, b) => {
			if (a.isAccepted && !b.isAccepted) return -1;
			if (!a.isAccepted && b.isAccepted) return 1;

			switch (sortBy) {
				case "newest":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "oldest":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case "votes":
				default:
					return b.upvotes - a.upvotes;
			}
		});

		setSortedAnswers(newSortedAnswers);
	}, [answers, sortBy]);

	if (answers.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="py-10 text-center"
			>
				<p className="text-gray-500 dark:text-gray-400">
					No answers yet. Be the first to answer this question!
				</p>
			</motion.div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<span className="text-sm text-gray-500 dark:text-gray-400">
					Showing {answers.length} answer{answers.length !== 1 ? "s" : ""}
				</span>

				<div className="flex items-center">
					<span className="w-full text-sm text-gray-500 dark:text-gray-400 mr-2">
						Sort by:
					</span>
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="select-modern text-sm"
					>
						<option value="votes">Votes</option>
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
					</select>
				</div>
			</div>

			<div className="space-y-6">
				<AnimatePresence mode="popLayout" initial={false}>
					{sortedAnswers.map((answer) => (
						<motion.div
							key={answer.id}
							layoutId={`${answer.id}`}
							layout={sortBy === "votes"}
							// Only apply initial animation on first render
							initial={
								initialRenderComplete.current ? false : { opacity: 0, y: 20 }
							}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, height: 0, overflow: "hidden" }}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 30,
								duration: 0.3,
							}}
						>
							<AnswerItem
								answer={answer}
								isQuestionAuthor={answer.isAccepted}
							/>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</div>
	);
}

export default memo(AnswerList);
