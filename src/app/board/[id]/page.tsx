// app/group/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useBoardStore } from "../../../store/boardStore";
import GroupHeader from "../../../components/board/GroupHeader";
import AskQuestion from "../../../components/board/AskQuestion";
import QuestionList from "../../../components/board/QuestionList";

export default function GroupPage() {
	const params = useParams();
	const groupId = params?.id as string;

	// Get state from store
	const { group, loadGroup, isLoading } = useBoardStore();

	// Load group data when the component mounts
	useEffect(() => {
		loadGroup(groupId);
	}, [groupId, loadGroup]);

	// Show loading state if group data hasn't loaded yet
	if (isLoading || !group) {
		return (
			<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
				<div className="text-center">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
						className="inline-block w-8 h-8 border-3 border-[#426EFF] border-t-transparent rounded-full"
					/>
					<p className="mt-4 text-gray-600">Loading group...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					{/* Group Header with info and stats */}
					<GroupHeader group={group} />

					{/* Form to ask a new question */}
					<AskQuestion />

					{/* List of questions */}
					<QuestionList groupId={groupId} />
				</motion.div>
			</div>
		</div>
	);
}
