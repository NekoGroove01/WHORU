"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";

type TagManagerProps = {
	groupId: string;
	initialTags: string[];
	onTagsUpdate: (tags: string[]) => void;
};

export default function TagManager({
	initialTags,
	onTagsUpdate,
}: Readonly<TagManagerProps>) {
	const [tags, setTags] = useState<string[]>(initialTags);
	const [newTag, setNewTag] = useState("");
	const [isEditing, setIsEditing] = useState(false);

	const handleAddTag = () => {
		if (!newTag.trim()) return;

		// Check if tag already exists
		if (tags.includes(newTag.trim())) {
			// Could show an error message here
			return;
		}

		const updatedTags = [...tags, newTag.trim()];
		setTags(updatedTags);
		onTagsUpdate(updatedTags);
		setNewTag("");
	};

	const handleRemoveTag = (tagToRemove: string) => {
		const updatedTags = tags.filter((tag) => tag !== tagToRemove);
		setTags(updatedTags);
		onTagsUpdate(updatedTags);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between mb-2">
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{tags.length === 0
						? "No tags created yet. Add tags to help organize questions."
						: `${tags.length} tag${tags.length === 1 ? "" : "s"} created`}
				</p>

				<button
					onClick={() => setIsEditing(!isEditing)}
					className="text-sm text-primary dark:text-primary-light hover:underline flex items-center"
				>
					{isEditing ? (
						<>
							<FaCheck className="mr-1" /> Done
						</>
					) : (
						<>
							<FaPlus className="mr-1" /> Add/Edit Tags
						</>
					)}
				</button>
			</div>

			{/* Tag list */}
			<div className="flex flex-wrap gap-2">
				<AnimatePresence>
					{tags.map((tag) => (
						<motion.div
							key={tag}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className={`
                px-3 py-1 rounded-full text-sm flex items-center
                ${
									isEditing
										? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
										: "bg-primary-lighter/10 text-primary dark:text-primary-light"
								}
              `}
						>
							<span>{tag}</span>

							{isEditing && (
								<button
									onClick={() => handleRemoveTag(tag)}
									className="ml-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
								>
									<FaTimes />
								</button>
							)}
						</motion.div>
					))}
				</AnimatePresence>
			</div>

			{/* Add new tag form */}
			{isEditing && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="mt-4"
				>
					<div className="flex">
						<input
							type="text"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							placeholder="Enter new tag"
							className="w-full rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
							maxLength={20}
						/>
						<button
							onClick={handleAddTag}
							className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors disabled:opacity-50"
							disabled={!newTag.trim() || tags.includes(newTag.trim())}
						>
							Add
						</button>
					</div>

					<div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
						<p>
							Tags should be short and descriptive. Max 20 characters per tag.
						</p>
						<p>
							Examples: &quot;Design&quot;, &quot;Product&quot;,
							&quot;Feedback&quot;, &quot;Technical&quot;, &quot;General&quot;
						</p>
					</div>

					{tags.length >= 10 && (
						<p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
							Maximum of 10 tags recommended for better usability.
						</p>
					)}
				</motion.div>
			)}
		</div>
	);
}
