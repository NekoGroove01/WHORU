"use client";

import { motion } from "framer-motion";
import { FaFire, FaClock, FaUser, FaQuestionCircle } from "react-icons/fa";

type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionTabsProps = {
	activeTab: Tab;
	setActiveTab: (tab: Tab) => void;
	questionCount: number;
};

export default function QuestionTabs({
	activeTab,
	setActiveTab,
}: Readonly<QuestionTabsProps>) {
	const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
		{ id: "all", label: "All", icon: <FaQuestionCircle /> },
		{ id: "popular", label: "Popular", icon: <FaFire /> },
		{ id: "recent", label: "Recent", icon: <FaClock /> },
		{ id: "mine", label: "My Questions", icon: <FaUser /> },
		{ id: "unanswered", label: "Unanswered", icon: <FaQuestionCircle /> },
	];

	return (
		<div className="mt-2 bg-white border order-gray-100 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
			<div className="flex">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`relative py-3 px-4 text-sm font-medium transition-colors flex items-center flex-shrink-0 gap-1
              ${
								activeTab === tab.id
									? "text-primary dark:text-primary-light"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
							}`}
					>
						{tab.icon}
						<span className="hidden sm:inline">{tab.label}</span>

						{activeTab === tab.id && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-light"
								initial={false}
							/>
						)}
					</button>
				))}
			</div>
		</div>
	);
}
