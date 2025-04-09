// components/browse/GroupCard.tsx

import { motion } from "framer-motion";
import Link from "next/link";
import { Group } from "@/types/browse";

/**
 * GroupCard component
 * @param group - The group object containing group details.
 * @param group.id - The unique identifier for the group.
 * @param group.name - The name of the group.
 * @param group.description - A brief description of the group.
 * @param group.memberCount - The number of members in the group.
 * @param group.questionCount - The number of questions in the group.
 * @param group.tags - An array of tags associated with the group.
 * @param group.isActive - A boolean indicating if the group is active.
 * @param group.lastActivity - The last activity date of the group (optional).
 * @param group.createdAt - The creation date of the group (optional).
 * @returns html element
 * @description 그룹 정보를 나타내는 카드 엘리먼트
 */
export function GroupCard({ group }: Readonly<{ group: Group }>) {
	return (
		<motion.div
			whileHover={{ y: -5, transition: { duration: 0.2 } }}
			className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all"
		>
			<div className="h-3 bg-gradient-primary" />
			<div className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-xl font-semibold truncate">{group.name}</h3>
					<span
						className={`px-2 py-1 text-xs rounded-full ${
							group.isActive
								? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
								: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
						}`}
					>
						{group.isActive ? "Active" : "Quiet"}
					</span>
				</div>

				<p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
					{group.description}
				</p>

				<div className="flex flex-wrap gap-2 mb-4">
					{group.tags.map((tag) => (
						<span
							key={tag}
							className="p-1 mt-2 text-primary dark:text-primary-light text-xs"
						>
							{tag}
						</span>
					))}
				</div>

				<div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
					<span>{group.memberCount} members</span>
					<span>{group.questionCount} questions</span>
				</div>
			</div>

			<div className="px-6 py-4 bg-white dark:bg-gray-900/75 border-t border-gray-200 dark:border-gray-700">
				<Link
					href={`/group/${group.id}`}
					className="w-full py-2 flex justify-center items-center text-primary dark:text-primary-light hover:underline"
				>
					Join Group
				</Link>
			</div>
		</motion.div>
	);
}
