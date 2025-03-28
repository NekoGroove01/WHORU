// components/board/QuestionList.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FiFilter } from "react-icons/fi";
import { useBoardStore } from "@/store/boardStore";
import QuestionItem from "./QeustionItem";
import { QuestionListProps } from "@/types/board";

export default function QuestionList({ groupId }: Readonly<QuestionListProps>) {
	// Get state and actions from the store
	const { questions, loadQuestions, isLoading, sortBy, setSortBy } =
		useBoardStore();

	// Load questions on component mount
	useEffect(() => {
		loadQuestions(groupId);
	}, [groupId, loadQuestions]);

	// Sort questions based on selected sort method
	const sortedQuestions = [...questions].sort((a, b) => {
		if (sortBy === "newest") {
			return b.createdAt.getTime() - a.createdAt.getTime();
		} else if (sortBy === "popular") {
			return b.upvotes - a.upvotes;
		} else if (sortBy === "unanswered") {
			// Sort by unanswered first, then by newest
			if (a.isAnswered !== b.isAnswered) {
				return a.isAnswered ? 1 : -1;
			}
			return b.createdAt.getTime() - a.createdAt.getTime();
		}
		return 0;
	});

	return (
		<div>
			{/* Sorting controls */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold">Questions</h2>

				<div className="flex items-center gap-2">
					<FiFilter className="text-gray-500" />
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as any)}
						className="p-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#426EFF]"
					>
						<option value="newest">Newest</option>
						<option value="popular">Most Upvoted</option>
						<option value="unanswered">Unanswered</option>
					</select>
				</div>
			</div>

			{/* Loading state */}
			{isLoading ? (
				<div className="text-center py-10">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
						className="inline-block w-6 h-6 border-2 border-[#426EFF] border-t-transparent rounded-full"
					/>
					<p className="mt-2 text-gray-500">Loading questions...</p>
				</div>
			) : (
				// Questions list
				<div className="space-y-4">
					{sortedQuestions.length === 0 ? (
						<div className="bg-white rounded-lg p-8 text-center shadow-sm">
							<p className="text-gray-500">
								No questions yet. Be the first to ask!
							</p>
						</div>
					) : (
						sortedQuestions.map((question) => (
							<QuestionItem key={question.id} question={question} />
						))
					)}
				</div>
			)}
		</div>
	);
}
