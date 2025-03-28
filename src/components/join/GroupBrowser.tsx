// app/join/components/GroupBrowser.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiUsers, FiCheck, FiX } from "react-icons/fi";

// Mock data for public groups
const publicGroups = [
	{
		id: "123abc",
		name: "Campus Questions",
		memberCount: 142,
		description: "Anonymous Q&A for university students and faculty",
	},
	{
		id: "456def",
		name: "Tech Interviews",
		memberCount: 87,
		description: "Ask about interview experiences and tips anonymously",
	},
	{
		id: "789ghi",
		name: "Remote Work Hub",
		memberCount: 215,
		description: "Discuss remote work challenges without revealing who you are",
	},
	{
		id: "012jkl",
		name: "Film Critics Anonymous",
		memberCount: 63,
		description: "Share honest film opinions without judgment",
	},
];

type GroupBrowserProps = {
	onSelectGroup: (groupId: string) => void;
};

export default function GroupBrowser({ onSelectGroup }: Readonly<GroupBrowserProps>) {
	const [searchTerm, setSearchTerm] = useState("");

	// Filter groups based on search term
	const filteredGroups = publicGroups.filter(
		(group) =>
			group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			group.description.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-5">
			<SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			<GroupList groups={filteredGroups} onSelectGroup={onSelectGroup} />
		</div>
	);
}

// Search bar component
function SearchBar({
	searchTerm,
	setSearchTerm,
}: Readonly<{
	searchTerm: string;
	setSearchTerm: (term: string) => void;
}>) {
	return (
		<div className="relative">
			{searchTerm.length === 0 && (
				<div className="absolute inset-y-0 left-1 pl-3 flex items-center pointer-events-none">
					<FiSearch className="text-gray-400" />
				</div>
			)}
			<input
				type="text"
				placeholder={"      Search public groups..."}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="w-full px-3 py-2 sm:px-4 sm:py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#426EFF] focus:border-transparent"
			/>
		</div>
	);
}

// Group list component
function GroupList({
	groups,
	onSelectGroup,
}: Readonly<{
	groups: any[];
	onSelectGroup: (groupId: string) => void;
}>) {
	if (groups.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
			{groups.map((group) => (
				<GroupItem
					key={group.id}
					group={group}
					onSelect={() => onSelectGroup(group.id)}
				/>
			))}
		</div>
	);
}

// Individual group item
function GroupItem({ group, onSelect }: Readonly<{ group: any; onSelect: () => void }>) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			whileHover={{ scale: 1.01 }}
			className="border border-gray-200 rounded-lg m-2 p-4 hover:border-[#426EFF] hover:shadow-sm transition-all cursor-pointer"
			onClick={onSelect}
		>
			<div className="flex justify-between items-start mb-2">
				<h3 className="font-medium">{group.name}</h3>
				<div className="flex items-center text-xs text-gray-500">
					<FiUsers className="mr-1" /> {group.memberCount}
				</div>
			</div>
			<p className="text-sm text-gray-600 mb-3 line-clamp-2">
				{group.description}
			</p>
			<div className="text-right">
				<button
					className="inline-flex items-center text-xs sm:text-sm text-[#426EFF] hover:underline"
					onClick={(e) => {
						e.stopPropagation();
						onSelect();
					}}
				>
					Join Group <FiCheck className="ml-1" />
				</button>
			</div>
		</motion.div>
	);
}

// Empty state when no groups match search
function EmptyState() {
	return (
		<div className="text-center py-8">
			<FiX className="w-10 h-10 mx-auto text-gray-400 mb-2" />
			<p className="text-gray-500">
				No public groups found matching your search.
			</p>
			<p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
		</div>
	);
}
