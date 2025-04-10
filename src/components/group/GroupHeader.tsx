"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	FaArrowLeft,
	FaCopy,
	FaCheck,
	FaUsers,
	FaQuestionCircle,
} from "react-icons/fa";
import { Group } from "@/types/group";
import { useBackNavigation } from "@/app/hooks/useBackNavigation";

interface GroupHeader {
	group: Group;
}

export default function GroupHeader({ group }: Readonly<GroupHeader>) {
	const [copied, setCopied] = useState(false);

	// navigation for going previous page
	const { goBack } = useBackNavigation("/");

	const copyGroupLink = () => {
		const url = window.location.href;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div className="container mx-auto my-4 px-4 py-4">
				<div className="flex items-center mb-2">
					<button
						onClick={goBack}
						className="text-primary dark:text-primary-light mr-3 flex items-center hover:underline"
					>
						<FaArrowLeft className="mr-1" /> Back
					</button>

					<motion.button
						onClick={copyGroupLink}
						whileTap={{ scale: 0.95 }}
						className="text-sm flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
					>
						{copied ? (
							<>
								<FaCheck className="mr-1 text-green-500" />
								<span>Copied!</span>
							</>
						) : (
							<>
								<FaCopy className="mr-1" />
								<span>Share</span>
							</>
						)}
					</motion.button>
				</div>

				<h1 className="mt-2 !text-4xl !md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
					{group.name}
				</h1>

				{group.description && (
					<p className="mt-2 text-gray-600 dark:text-gray-300 mb-3 max-w-2xl">
						{group.description}
					</p>
				)}

				<div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center">
						<FaUsers className="mr-1" />
						<span>{group.memberCount} members</span>
					</div>

					<div className="flex items-center">
						<FaQuestionCircle className="mr-1" />
						<span>{group.questionCount} questions</span>
					</div>

					<div>
						<span>Created: {formatDate(group.createdAt)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatDate(dateString?: string): string {
	if (!dateString) return "Unknown";

	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}
