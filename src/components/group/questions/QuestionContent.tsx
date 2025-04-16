"use client";

import { motion } from "framer-motion";
import { Question } from "@/types/question";

type QuestionContentProps = {
	question: Question;
};

export default function QuestionContent({ question }: Readonly<QuestionContentProps>) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5"
		>
			<div className="prose dark:prose-invert prose-blue max-w-none">
				<p className="whitespace-pre-line">{question.content}</p>
			</div>

			<div className="mt-6 flex flex-wrap gap-2">
				{question.tags.map((tag) => (
					<span
						key={tag}
						className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary-lighter/10 text-primary dark:text-primary-light"
					>
						{tag}
					</span>
				))}
			</div>
		</motion.div>
	);
}
