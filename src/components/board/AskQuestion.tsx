// components/board/AskQuestion.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { useBoardStore } from "../../store/boardStore";
import TextareaAutosize from "react-textarea-autosize";

export default function AskQuestion() {
	const [question, setQuestion] = useState("");
	const [nickname, setNickname] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);

	const addQuestion = useBoardStore((state) => state.addQuestion);

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (question.trim() && nickname.trim()) {
			addQuestion(question, nickname);
			setQuestion("");
			setNickname("");
			setIsExpanded(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white rounded-lg p-6 shadow-sm mb-8"
		>
			<h2 className="text-xl font-semibold mb-4">Ask a Question</h2>

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<TextareaAutosize
						minRows={2}
						maxRows={6}
						placeholder="What would you like to ask?"
						value={question}
						onChange={(e) => {
							setQuestion(e.target.value);
							if (!isExpanded && e.target.value.length > 0) {
								setIsExpanded(true);
							}
						}}
						className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
					/>
				</div>

				{isExpanded && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="mb-4"
					>
						<input
							type="text"
							placeholder="Your nickname (will remain anonymous)"
							value={nickname}
							onChange={(e) => setNickname(e.target.value)}
							className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
						/>
					</motion.div>
				)}

				<div className="flex justify-end">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type="submit"
						disabled={!question.trim() || !nickname.trim()}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg 
              ${
								!question.trim() || !nickname.trim()
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-[#426EFF] text-white hover:bg-blue-600"
							}`}
					>
						<FiSend />
						<span>Ask</span>
					</motion.button>
				</div>
			</form>
		</motion.div>
	);
}
