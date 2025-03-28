// components/board/GroupHeader.tsx
"use client";

import { motion } from "framer-motion";
import { FiUsers, FiMessageSquare, FiLock, FiUnlock } from "react-icons/fi";
import { Group } from "../../types/board";

interface GroupHeaderProps {
	group: Group;
}

export default function GroupHeader({ group }: Readonly<GroupHeaderProps>) {
	// Format date to a readable string
	const formattedDate = new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(group.createdAt);

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white rounded-lg p-6 shadow-sm mb-6"
		>
			<div className="flex items-start justify-between">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold">{group.name}</h1>
						{group.isPrivate ? (
							<FiLock className="text-gray-500" />
						) : (
							<FiUnlock className="text-gray-500" />
						)}
					</div>
					<p className="text-gray-600 mt-2">{group.description}</p>
				</div>
			</div>

			<div className="flex items-center mt-6 text-sm text-gray-500 gap-6">
				<div className="flex items-center gap-1">
					<FiUsers className="text-[#426EFF]" />
					<span>{group.memberCount} members</span>
				</div>
				<div className="flex items-center gap-1">
					<FiMessageSquare className="text-[#426EFF]" />
					<span>{group.questionCount} questions</span>
				</div>
				<div>Created on {formattedDate}</div>
			</div>
		</motion.div>
	);
}
