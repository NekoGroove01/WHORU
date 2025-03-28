// components/board/AskQuestion.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBoardStore } from "../../store/boardStore";
import TextareaAutosize from "react-textarea-autosize";
import { FiChevronUp, FiMessageSquare, FiSend } from "react-icons/fi";
import { QuestionItemProps } from "@/types/board";

export default function QuestionItem({
	question,
}: Readonly<QuestionItemProps>) {
	const [showAnswers, setShowAnswers] = useState(false);
	const [answerContent, setAnswerContent] = useState("");
	const [nickname, setNickname] = useState("");
	const [showAnswerForm, setShowAnswerForm] = useState(false);

	const { upvoteQuestion, addAnswer } = useBoardStore();

	// Format date to a readable string
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Handle upvote
	const handleUpvote = () => {
		upvoteQuestion(question.id);
	};

	// Handle submitting a new answer
	const handleSubmitAnswer = (e: React.FormEvent) => {
		e.preventDefault();

		if (answerContent.trim() && nickname.trim()) {
			addAnswer(question.id, answerContent, nickname);
			setAnswerContent("");
			setNickname("");
			setShowAnswerForm(false);
			setShowAnswers(true); // Show answers after adding a new one
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white rounded-lg p-6 shadow-sm mb-4 transition-all"
		>
			<div className="flex gap-4">
				{/* Upvote button */}
				<div className="flex flex-col items-center">
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={handleUpvote}
						className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-blue-50 transition-colors"
					>
						<FiChevronUp className="text-[#426EFF] text-xl" />
						<span className="font-medium text-gray-700">
							{question.upvotes}
						</span>
					</motion.button>
				</div>

				{/* Question content */}
				<div className="flex-1">
					<div className="flex justify-between items-start">
						<h3 className="font-medium text-lg">{question.content}</h3>
					</div>

					<div className="mt-2 flex items-center justify-between text-sm text-gray-500">
						<div className="flex items-center gap-4">
							<span>{question.nickname}</span>
							<span>{formatDate(question.createdAt)}</span>
						</div>

						<button
							onClick={() => setShowAnswers(!showAnswers)}
							className="flex items-center gap-1 hover:text-[#426EFF] transition-colors"
						>
							<FiMessageSquare />
							<span>
								{question.answers.length}{" "}
								{question.answers.length === 1 ? "answer" : "answers"}
							</span>
						</button>
					</div>

					{/* Answers section */}
					{showAnswers && question.answers.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mt-6 pl-4 border-l-2 border-gray-100 space-y-4"
						>
							{question.answers.map((answer) => (
								<div key={answer.id} className="pb-3">
									<p className="text-gray-800">{answer.content}</p>
									<div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
										<span>{answer.nickname}</span>
										<span>{formatDate(answer.createdAt)}</span>
									</div>
								</div>
							))}
						</motion.div>
					)}

					{/* Answer form toggle button */}
					<div className="mt-4">
						<button
							onClick={() => setShowAnswerForm(!showAnswerForm)}
							className="text-sm text-[#426EFF] hover:underline"
						>
							{showAnswerForm ? "Cancel" : "Answer this question"}
						</button>
					</div>

					{/* Answer form */}
					{showAnswerForm && (
						<motion.form
							initial={{ opacity: 0, y: 5 }}
							animate={{ opacity: 1, y: 0 }}
							className="mt-4"
							onSubmit={handleSubmitAnswer}
						>
							<div className="mb-3">
								<TextareaAutosize
									minRows={2}
									maxRows={4}
									placeholder="Your answer..."
									value={answerContent}
									onChange={(e) => setAnswerContent(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#426EFF]"
								/>
							</div>

							<div className="mb-3">
								<input
									type="text"
									placeholder="Your nickname"
									value={nickname}
									onChange={(e) => setNickname(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#426EFF]"
								/>
							</div>

							<div className="flex justify-end">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									type="submit"
									disabled={!answerContent.trim() || !nickname.trim()}
									className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm
                      ${
												!answerContent.trim() || !nickname.trim()
													? "bg-gray-300 text-gray-500 cursor-not-allowed"
													: "bg-[#426EFF] text-white hover:bg-blue-600"
											}`}
								>
									<FiSend className="text-xs" />
									<span>Submit</span>
								</motion.button>
							</div>
						</motion.form>
					)}
				</div>
			</div>
		</motion.div>
	);
}
