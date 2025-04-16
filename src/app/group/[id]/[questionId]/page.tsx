"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGroupStore } from "@/store/groupStore";
import { useQuestionStore } from "@/store/questionStore";
import { useAnswerStore } from "@/store/answerStore";
import QuestionHeader from "@/components/group/questions/QuestionHeader";
import QuestionContent from "@/components/group/questions/QuestionContent";
import AnswerList from "@/components/group/questions/AnswerList";
import AddAnswerForm from "@/components/group/questions/AddAnswerForm";
import NotFound from "@/app/not-found";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { FaArrowLeft } from "react-icons/fa";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function QuestionPage() {
	const params = useParams();

	// Get the router instance to go back
	const { goBack } = useBackNavigation();

	// Get the groupId and questionId from the URL parameters
	const groupId = params?.id as string;
	const questionId = params?.questionId as string;

	const [isLoading, setIsLoading] = useState(true);

	// Get state from stores
	const { group, fetchGroup } = useGroupStore();
	const { fetchQuestionById, question } = useQuestionStore();
	const { fetchAnswers, answers } = useAnswerStore();

	// First effect - fetch initial data
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				// Load group and question data in parallel
				await Promise.all([fetchGroup(groupId), fetchQuestionById(questionId)]);
			} catch (error) {
				console.error("Failed to load question data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [groupId, questionId, fetchGroup, fetchQuestionById]);

	// Second effect - fetch answers when question changes
	useEffect(() => {
		const fetchQuestionAnswers = async () => {
			if (question) {
				try {
					await fetchAnswers(questionId);
				} catch (error) {
					console.error("Failed to load answers:", error);
				}
			}
		};

		fetchQuestionAnswers();
	}, [question, questionId, fetchAnswers]);

	// Show loading state
	if (isLoading) {
		return <LoadingScreen size="lg" fullscreen text="Loading question..." />;
	}

	// Show not found if question doesn't exist
	if (!question || !group) {
		return <NotFound />;
	}

	return (
		<div className="min-h-screen pb-20">
			<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
				<div className="container mx-auto p-6">
					<div className="flex items-center">
						<button
							onClick={goBack}
							className="text-primary dark:text-primary-light flex items-center hover:underline"
						>
							<FaArrowLeft className="mr-2" /> Back
						</button>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				<div className="max-w-4xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						{/* Question Header */}
						<QuestionHeader question={question} groupId={groupId} />

						{/* Question Content */}
						<QuestionContent question={question} />

						{/* Answer Count */}
						<div className="mt-10 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
							<h2 className="!text-2xl md:!text-3xl font-semibold">
								{answers.length} {answers.length === 1 ? "Answer" : "Answers"}
							</h2>
						</div>

						{/* Answers List */}
						<AnswerList
							answers={answers}
							questionAuthorId={question.authorId}
						/>

						{/* Add Answer Form */}
						<div className="mt-10">
							<h3 className="text-lg font-medium mb-4">Your Answer</h3>
							<AddAnswerForm questionId={questionId} />
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
