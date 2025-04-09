"use client";

import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

type TagFilterProps = {
	tags: string[];
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
};

export default function TagFilter({
	tags,
	selectedTags,
	setSelectedTags,
}: Readonly<TagFilterProps>) {
	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const clearAllTags = () => {
		setSelectedTags([]);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700"
		>
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-md font-medium text-gray-900 dark:text-white">
					Filter by Tags
				</h3>

				{selectedTags.length > 0 && (
					<button
						onClick={clearAllTags}
						className="text-xs text-gray-500 hover:text-red-500 flex items-center"
					>
						<FaTimes className="mr-1" /> Clear all
					</button>
				)}
			</div>

			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<motion.button
						key={tag}
						whileTap={{ scale: 0.95 }}
						onClick={() => toggleTag(tag)}
						className={`px-3 py-1 rounded-full text-sm transition-colors ${
							selectedTags.includes(tag)
								? "bg-primary text-white"
								: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
						}`}
					>
						{tag}
					</motion.button>
				))}

				{tags.length === 0 && (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						No tags available for this group
					</p>
				)}
			</div>
		</motion.div>
	);
}
