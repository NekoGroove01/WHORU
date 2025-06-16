"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCommentAlt, FaRegClock, FaHeart, FaRegHeart } from "react-icons/fa";
import { Question } from "@/types/question";
import { useQuestionStore } from "@/store/questionStore";

type QuestionCardProps = {
	question: Question;
};

export default function QuestionCard({
	question,
}: Readonly<QuestionCardProps>) {
	const [hasVoted, setHasVoted] = useState<boolean>(false);
	const { upvoteQuestion } = useQuestionStore();

	const handleVote = () => {
		if (hasVoted) return;

		upvoteQuestion(question.id);

		setHasVoted(true);
	};

	const formattedDate = new Date(question.createdAt).toLocaleDateString(
		"en-US",
		{
			month: "short",
			day: "numeric",
		}
	);

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
			<div className="p-6">
				{/* Question content */}
				<div className="flex-1">
					<Link href={`/group/${question.groupId}/${question.id}`}>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light mb-2">
							{question.title === "" ? "No Title" : question.title}
						</h3>
					</Link>

					<p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
						{question.content}
					</p>

					<div className="flex flex-wrap gap-2 mb-3">
						{question.tags.map((tag) => (
							<span
								key={tag}
								className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
							>
								{tag}
							</span>
						))}
					</div>

					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-4">
							{/* Like button */}
							<motion.button
								whileTap={{ scale: 0.85 }}
								onClick={handleVote}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
									hasVoted
										? "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
										: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
								aria-label="Like question"
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
									key={`vote-${question.upvotes}`}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 400, damping: 10 }}
								>
									{question.upvotes}
								</motion.span>
							</motion.button>

							<span className="text-gray-500 dark:text-gray-400 flex items-center">
								<FaCommentAlt className="mr-1" /> {question.answerCount} answers
							</span>
							<span className="text-gray-500 dark:text-gray-400 flex items-center">
								<FaRegClock className="mr-1" /> {formattedDate}
							</span>
						</div>

						<span className="text-gray-500 dark:text-gray-400">
							{question.authorNickname}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
