"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useGroupStore } from "@/store/groupStore";
import { useQuestionStore } from "@/store/questionStore";
import GroupHeader from "@/components/group/GroupHeader";
import QuestionTabs from "@/components/group/QuestionTabs";
import QuestionList from "@/components/group/QuestionList";
import AskQuestionForm from "@/components/group/AskQuestionForm";
import TagFilter from "@/components/group/Tagfilter";
import GroupNotFound from "@/components/group/GroupNotFound";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useAccessKey } from "@/hooks/useAccessKey";

export default function GroupPage() {
	const params = useParams();
	const groupId = (params?.id as string) ?? "";
	const [isLoading, setIsLoading] = useState(true);

	// Get state from stores
	const { group, fetchGroup, setActiveGroup } = useGroupStore();
	const { getAccessKey, hasAccessKey } = useAccessKey();
	const {
		questions,
		fetchQuestions,
		activeTab,
		setActiveTab,
		selectedTags,
		setSelectedTags,
	} = useQuestionStore();

	useEffect(() => {
		const loadGroupData = async () => {
			setIsLoading(true);
			try {
				const accessKey = hasAccessKey(groupId) ? getAccessKey(groupId) : null;
				console.log("Access Key:", accessKey);
				// Fetch group data
				await fetchGroup(groupId, accessKey);
				// Fetch questions for this group
				await fetchQuestions(groupId);
			} catch (error) {
				console.error("Failed to load group data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadGroupData();

		// Cleanup function
		return () => {
			setActiveGroup(null);
		};
	}, [
		groupId,
		hasAccessKey,
		getAccessKey,
		fetchGroup,
		fetchQuestions,
		setActiveGroup,
	]);

	// Return loading state
	if (isLoading) {
		return <LoadingScreen size="lg" text="Loading..." />;
	}

	// Return not found state
	if (!group) {
		return <GroupNotFound />;
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="min-h-screen pb-20"
		>
			<GroupHeader group={group} />

			<div className="container mx-auto px-4 mt-4">
				<div className="flex flex-col lg:flex-row-reverse gap-6">
					{/* Sidebar - 30% on desktop */}
					<div className="w-full lg:w-[30%]">
						<div className="lg:sticky lg:top-4 lg:z-10">
							<AskQuestionForm groupId={groupId} />

							<div className="mt-4 hidden lg:block">
								<TagFilter
									tags={group.tags}
									selectedTags={selectedTags}
									setSelectedTags={setSelectedTags}
								/>
							</div>
						</div>
					</div>
					{/* Main content - 70% on desktop */}
					<div className="w-full lg:w-[70%]">
						<QuestionTabs
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							questionCount={questions.length}
						/>

						<div className="mt-4 lg:hidden">
							<TagFilter
								tags={group.tags}
								selectedTags={selectedTags}
								setSelectedTags={setSelectedTags}
							/>
						</div>

						<QuestionList
							questions={questions}
							activeTab={activeTab}
							selectedTags={selectedTags}
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
