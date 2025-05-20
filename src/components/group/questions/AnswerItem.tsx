"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronUp, FaChevronDown, FaClock, FaCheck } from "react-icons/fa";
import { Answer } from "@/types/answer";
import { useAnswerStore } from "@/store/answerStore";
import { formatDistanceToNow } from "@/utils/dateUtils";

type AnswerItemProps = {
	answer: Answer;
	isQuestionAuthor: boolean;
};

export default function AnswerItem({
	answer,
	isQuestionAuthor,
}: Readonly<AnswerItemProps>) {
	const [hasVoted, setHasVoted] = useState<boolean>(false);
	const { upvoteAnswer, acceptAnswer } = useAnswerStore();

	const handleVote = () => {
		if (hasVoted) {
			return;
		}

		upvoteAnswer(answer.id);
		setHasVoted(true);
	};

	const handleAccept = () => {
		if (isQuestionAuthor) {
			acceptAnswer(answer.id);
		}
	};

	return (
		<div
			className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
				answer.isAccepted
					? "border-green-200 dark:border-green-800"
					: "border-gray-200 dark:border-gray-700"
			}`}
		>
			{/* Accepted banner */}
			{answer.isAccepted && (
				<div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-t-lg flex items-center">
					<FaCheck className="mr-2" />
					<span className="font-medium">Accepted Answer</span>
				</div>
			)}

			<div className="p-5">
				<div className="flex items-center">
					{/* Vote controls */}
					<div className="flex flex-col items-center mr-4">
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={() => handleVote()}
							className={`p-2 rounded-full ${
								hasVoted
									? "text-primary dark:text-primary-light bg-blue-50 dark:bg-blue-900/30"
									: "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
							}`}
							aria-label="Upvote"
						>
							<FaChevronUp />
						</motion.button>

						<motion.span
							className="text-lg font-semibold my-1"
							key={`vote-${answer.upvotes}`}
							initial={{ scale: 1.25 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 400, damping: 10 }}
						>
							{answer.upvotes}
						</motion.span>

						{isQuestionAuthor && !answer.isAccepted && (
							<button
								onClick={handleAccept}
								className="mt-2 text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400"
								title="Accept this answer"
							>
								<FaCheck className="w-5 h-5" />
							</button>
						)}
					</div>

					{/* Answer content */}
					<div className="flex-1">
						<div className="prose dark:prose-invert prose-blue max-w-none">
							<p className="whitespace-pre-line h-full">{answer.content}</p>
						</div>

						<div className="mt-4 flex justify-between items-center text-sm">
							<span className="text-gray-500 dark:text-gray-400">
								{answer.authorNickname}
							</span>

							<div className="flex items-center text-gray-500 dark:text-gray-400">
								<FaClock className="mr-1" />
								<span>
									Answered {formatDistanceToNow(new Date(answer.createdAt))} ago
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
