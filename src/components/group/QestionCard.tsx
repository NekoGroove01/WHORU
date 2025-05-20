"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	FaChevronUp,
	FaChevronDown,
	FaCommentAlt,
	FaRegClock,
} from "react-icons/fa";
import { Question } from "@/types/question";
import { useQuestionStore } from "@/store/questionStore";
import { RiThumbUpLine } from "react-icons/ri";

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
			<div className="p-4 flex">
				{/* Voting controls */}
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
						<RiThumbUpLine />
					</motion.button>

					<span className="text-lg font-semibold my-1">{question.upvotes}</span>
				</div>

				{/* Question content */}
				<div className="flex-1">
					<Link href={`/group/${question.groupId}/${question.id}`}>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-light mb-2">
							{question.title}
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
						<div className="flex gap-4">
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
