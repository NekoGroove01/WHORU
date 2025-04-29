"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	FaChevronUp,
	FaChevronDown,
	FaClock,
	FaEllipsisH,
	FaStar,
	FaFlag,
	FaShare,
} from "react-icons/fa";
import { Question } from "@/types/question";
import { useQuestionStore } from "@/store/questionStore";
import { formatDistanceToNow } from "@/utils/dateUtils";

type QuestionHeaderProps = {
	question: Question;
};

export default function QuestionHeader({
	question,
}: Readonly<QuestionHeaderProps>) {
	const [hasVoted, setHasVoted] = useState<"up" | "down" | null>(null);
	const [showActions, setShowActions] = useState(false);
	const { upvoteQuestion, downvoteQuestion } = useQuestionStore();

	const handleVote = (voteType: "up" | "down") => {
		if (hasVoted === voteType) return;

		if (voteType === "up") {
			upvoteQuestion(question.id, hasVoted);
		} else {
			downvoteQuestion(question.id, hasVoted);
		}

		setHasVoted(voteType);
	};

	return (
		<div className="mb-6">
			<div className="flex flex-col md:flex-row justify-between items-center gap-6">
				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="!text-3xl md:!text-4xl font-bold text-gray-900 dark:text-white"
				>
					{question.title}
				</motion.h1>

				<div className="flex items-center space-x-2 md:space-x-4">
					{/* Vote buttons */}
					<div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
						<motion.button
							whileTap={{ scale: 0.85 }}
							onClick={() => handleVote("up")}
							className={`p-2 rounded-full ${
								hasVoted === "up"
									? "text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/30"
									: "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
							}`}
							aria-label="Upvote"
						>
							<FaChevronUp />
						</motion.button>

						<motion.span
							className="px-2 font-medium"
							key={`vote-${question.upvotes - question.downvotes}`}
							initial={{ scale: 1.15 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							{question.upvotes - question.downvotes}
						</motion.span>

						<motion.button
							whileTap={{ scale: 0.85 }}
							onClick={() => handleVote("down")}
							className={`p-2 rounded-full ${
								hasVoted === "down"
									? "text-red-500 bg-red-50 dark:bg-red-900/30"
									: "text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
							}`}
							aria-label="Downvote"
						>
							<FaChevronDown />
						</motion.button>
					</div>

					{/* Actions menu */}
					<div className="relative">
						<button
							onClick={() => setShowActions(!showActions)}
							className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
							aria-label="More actions"
						>
							<FaEllipsisH />
						</button>

						{showActions && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700"
							>
								<button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
									<FaStar className="mr-2 text-amber-500" /> Pin to top
								</button>
								<button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
									<FaShare className="mr-2 text-blue-500" /> Share question
								</button>
								<button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
									<FaFlag className="mr-2 text-red-500" /> Report
								</button>
							</motion.div>
						)}
					</div>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-x-4 gap-y-2">
				<div className="flex items-center">
					<FaClock className="mr-1" />
					<span>
						Asked {formatDistanceToNow(new Date(question.createdAt))} ago
					</span>
				</div>

				<div>
					<span>By {question.authorName}</span>
				</div>

				<div>
					<span>{question.answerCount} answers</span>
				</div>
			</div>
		</div>
	);
}
