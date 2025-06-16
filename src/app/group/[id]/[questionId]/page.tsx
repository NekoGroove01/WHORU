"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGroupStore } from "@/store/groupStore";
import { useQuestionStore } from "@/store/questionStore";
import { useAnswerStore } from "@/store/answerStore";
import { useSocket } from "@/hooks/useSocket";
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

	// Initialize Socket.IO for real-time updates
	useSocket({
		groupId,
		onConnect: () => {
			console.log("Connected to Socket.IO server");
		},
		onDisconnect: () => {
			console.log("Disconnected from Socket.IO server");
		},
	});

	// Add this to prevent re-animating after initial load
	const [pageAnimationComplete, setPageAnimationComplete] = useState(false);

	// First effect - fetch initial data
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			try {
				// Load group and question data in parallel
				await Promise.all([
					fetchGroup(groupId, group?.accessKey ?? null),
					fetchQuestionById(questionId),
				]);
			} catch (error) {
				console.error("Failed to load question data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [groupId, group?.accessKey, questionId, fetchGroup, fetchQuestionById]);

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
						initial={!pageAnimationComplete ? { opacity: 0, y: 20 } : false}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						onAnimationComplete={() => setPageAnimationComplete(true)}
					>
						{/* Question Header */}
						<QuestionHeader question={question} />
						{/* Question Content */}
						<QuestionContent question={question} />
						{/* Answer Count */}
						<div className="mt-10 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
							<h2 className="!text-2xl md:!text-3xl font-semibold">
								{answers.length} {answers.length === 1 ? "Answer" : "Answers"}
							</h2>
						</div>
						{/* Answers List */}
						<AnswerList answers={answers} questionId={questionId} />{" "}
						{/* Add Answer Form */}{" "}
						<div className="mt-10">
							<AddAnswerForm
								questionId={questionId}
								questionContent={question?.content}
								groupId={groupId}
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
