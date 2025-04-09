"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	FaSearch,
	FaFilter,
	FaSortAmountDown,
	FaTimes,
	FaArrowLeft,
} from "react-icons/fa";
import { fadeIn, staggerContainer } from "@/utils/motion/app";
import { Group } from "@/types/browse";
import { GroupCard } from "@/components/browse/GroupCard";

// Form schema for filters
const filterSchema = z.object({
	search: z.string().optional(),
	tags: z.array(z.string()).optional(),
	status: z.enum(["all", "active", "quiet"]).default("all"),
	sort: z.enum(["newest", "popular", "active"]).default("popular"),
});

type FilterValues = z.infer<typeof filterSchema>;

/**
 * Sorts groups based on the given sort type.
 *
 * @param {Group[]} groupsToSort - The array of groups to sort
 * @param {string} sortType - The type of sorting to apply
 * @returns {Group[]} - The sorted array of groups
 */
const sortGroups = (groupsToSort: Group[], sortType: string): Group[] => {
	switch (sortType) {
		case "newest":
			return [...groupsToSort].sort(
				(a, b) =>
					new Date(b.createdAt ?? "").getTime() -
					new Date(a.createdAt ?? "").getTime()
			);
		case "popular":
			return [...groupsToSort].sort((a, b) => b.memberCount - a.memberCount);
		case "active":
			return [...groupsToSort].sort((a, b) => {
				// First sort by isActive
				if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
				// Then by question count
				return b.questionCount - a.questionCount;
			});
		default:
			return groupsToSort;
	}
};

export default function BrowsePage() {
	const [groups, setGroups] = useState<Group[]>([]);
	const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
	const [allTags, setAllTags] = useState<string[]>([]);
	const [showFilters, setShowFilters] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Form handling
	const { register, watch, reset, setValue } = useForm<FilterValues>({
		resolver: zodResolver(filterSchema),
		defaultValues: {
			search: "",
			tags: [],
			status: "all",
			sort: "popular",
		},
	});

	const watchedValues = watch();

	// apply filters when the search form values change
	const applyFilters = useCallback(
		(filters: FilterValues) => {
			let result = [...groups];

			// Apply search filter
			result = applySearchFilter(result, filters.search);

			// Apply tag filter
			result = applyTagFilter(result, filters.tags);

			// Apply status filter
			result = applyStatusFilter(result, filters.status);

			// Apply sorting
			result = sortGroups(result, filters.sort);

			setFilteredGroups(result);
		},
		[groups]
	);

	// --- Filter Functions (useEffect) ---

	// Helper functions for filtering
	const applySearchFilter = (items: Group[], search?: string) => {
		if (!search) return items;

		const searchLower = search.toLowerCase();
		return items.filter(
			(group) =>
				group.name.toLowerCase().includes(searchLower) ||
				group.description.toLowerCase().includes(searchLower) ||
				group.tags.some((tag) => tag.toLowerCase().includes(searchLower))
		);
	};

	const applyTagFilter = (items: Group[], tags?: string[]) => {
		if (!tags?.length) return items;
		return items.filter((group) =>
			tags.some((tag) => group.tags.includes(tag))
		);
	};

	const applyStatusFilter = (items: Group[], status: string) => {
		if (status === "all") return items;
		const isActive = status === "active";
		return items.filter((group) => group.isActive === isActive);
	};

	// --- End Filter Functions (useEffect) ---

	// Apply filters when form values change
	useEffect(() => {
		if (isLoading) return;

		const debounceTimer = setTimeout(() => {
			applyFilters(watchedValues);
		}, 300); // 300ms debounce delay

		return () => clearTimeout(debounceTimer);
	}, [watchedValues, isLoading, applyFilters]);

	// Simulate API call with an actual delay
	useEffect(() => {
		setGroups(dummyGroups);
		setFilteredGroups(dummyGroups);

		// Extract all unique tags
		const tagSet = new Set(dummyGroups.flatMap((group) => group.tags));
		setAllTags(Array.from(tagSet));

		setIsLoading(false);
	}, []);

	/**
	 * Toggles a tag in the watched form values.
	 * If the tag already exists in the array, it will be removed;
	 * otherwise, it will be added.
	 *
	 * @param {string} tag - The tag to toggle in the form values
	 * @returns {void}
	 */
	const toggleTag = (tag: string) => {
		const currentTags = watchedValues.tags || [];
		if (currentTags.includes(tag)) {
			setValue(
				"tags",
				currentTags.filter((t) => t !== tag)
			);
		} else {
			setValue("tags", [...currentTags, tag]);
		}
	};

	const clearFilters = () => {
		reset({
			search: "",
			tags: [],
			status: "all",
			sort: "popular",
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<div className="bg-gradient-primary text-white">
				<div className="container mx-auto px-4 py-12">
					<Link
						href="/"
						className="inline-flex items-center mb-6 text-white/80 hover:text-white"
					>
						<FaArrowLeft className="mr-2" /> Back to Home
					</Link>

					<motion.div
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
						className="max-w-2xl"
					>
						<motion.h1
							variants={fadeIn}
							className="text-3xl md:text-4xl font-bold mb-4"
						>
							Browse Groups
						</motion.h1>
						<motion.p variants={fadeIn} className="text-lg text-white/80 mb-8">
							Discover public question spaces created by the community. Join
							conversations, ask questions, and share your knowledge
							anonymously.
						</motion.p>

						{/* Search bar */}
						<motion.div variants={fadeIn} className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<FaSearch className="text-white/50" />
							</div>
							<input
								type="text"
								placeholder="Search groups..."
								{...register("search")}
								className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
							/>
						</motion.div>
					</motion.div>
				</div>
			</div>

			{/* Main content */}
			<div className="container mx-auto px-4 py-8">
				{/* Filter and sort controls */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
					<div className="flex items-center gap-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 px-4 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
						>
							<FaFilter className="text-primary dark:text-primary-light" />
							<span>Filters</span>
							{(watchedValues.tags && watchedValues.tags.length > 0) ||
							watchedValues.status !== "all" ? (
								<span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
									{(watchedValues.tags?.length ?? 0) +
										(watchedValues.status !== "all" ? 1 : 0)}
								</span>
							) : null}
						</button>

						<div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
							<span className="pl-3 pr-2">
								<FaSortAmountDown className="text-gray-500 dark:text-gray-400" />
							</span>
							<select
								{...register("sort")}
								className="py-2 pr-8 pl-1 border-0 bg-transparent focus:ring-0 text-sm"
							>
								<option value="popular">Most Popular</option>
								<option value="active">Most Active</option>
								<option value="newest">Newest First</option>
							</select>
						</div>
					</div>

					<p className="text-sm text-gray-600 dark:text-gray-400">
						Showing {filteredGroups.length} of {groups.length} groups
					</p>
				</div>

				{/* Expanded filters */}
				{showFilters && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 py-4 px-6 mb-6"
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-medium">Filter Options</h3>
							<button
								onClick={clearFilters}
								className="text-sm text-primary dark:text-primary-light hover:underline"
							>
								Clear All
							</button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Status filter */}
							<div className="">
								<h4 className="text-md font-medium mb-2">Status</h4>
								<div className="space-y-2 h-full">
									{["all", "active", "quiet"].map((status) => (
										<div key={status} className="flex items-center px-2 py-1">
											<label className="w-fit inline-block mr-4">
												<input
													type="radio"
													value={status}
													{...register("status")}
													className="rounded-full text-primary focus:ring-primary dark:bg-gray-700"
												/>
											</label>
											<span className="ml-2 text-sm capitalize">
												{status === "all" ? "All Groups" : `${status} Groups`}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Tags filter */}
							<div className="md:col-span-2">
								<h4 className="text-md font-medium mb-2">Topics</h4>
								<div className="flex flex-wrap gap-2 p-2 items-center">
									{allTags.map((tag) => (
										<button
											key={tag}
											onClick={() => toggleTag(tag)}
											className={`px-3 py-1 text-xs rounded-full ${
												watchedValues.tags?.includes(tag)
													? "bg-primary text-white"
													: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
											}`}
										>
											{tag}
										</button>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Groups grid */}
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div
								key={i}
								className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md animate-pulse"
							>
								<div className="h-3 bg-gray-200 dark:bg-gray-700" />
								<div className="p-6">
									<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
									<div className="flex flex-wrap gap-2 mb-4">
										{[1, 2, 3].map((j) => (
											<div
												key={j}
												className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"
											/>
										))}
									</div>
									<div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
									</div>
								</div>
								<div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
									<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full" />
								</div>
							</div>
						))}
					</div>
				) : filteredGroups.length > 0 ? (
					<motion.div
						initial="hidden"
						animate="visible"
						variants={{
							hidden: { opacity: 0 },
							visible: {
								opacity: 1,
								transition: { staggerChildren: 0.05 },
							},
						}}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{filteredGroups.map((group) => (
							<GroupCard key={group.id} group={group} />
						))}
					</motion.div>
				) : (
					<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
						<FaTimes className="mx-auto text-4xl text-gray-400 mb-4" />
						<h3 className="text-xl font-medium mb-2">
							No matching groups found
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Try adjusting your filters or search terms
						</p>
						<button onClick={clearFilters} className="btn-primary">
							Clear Filters
						</button>
					</div>
				)}

				{/* Create group CTA */}
				<div className="mt-12 mb-6 text-center bg-gradient-to-r from-primary-light to-primary-dark text-white rounded-xl p-8">
					<h2 className="text-2xl font-bold mb-4">
						Don&apos;t see what you&apos;re looking for?
					</h2>
					<p className="mb-6 text-white/90 max-w-lg mx-auto">
						Create your own anonymous question space and invite others to join.
						It&apos;s free and takes less than a minute.
					</p>
					<Link
						href="/create"
						className="inline-flex items-center px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-opacity-90 transition-all"
					>
						Create a Group
					</Link>
				</div>
			</div>
		</div>
	);
}
// Extended dummy data with more groups and dates
const dummyGroups: Group[] = [
	{
		id: "8Fn2JgUWUn57lPGk7L2b3",
		name: "Tech Talk",
		description:
			"Discuss the latest in technology, gadgets, and programming languages. Ask anything from beginner to advanced topics.",
		memberCount: 1248,
		questionCount: 356,
		tags: ["Technology", "Programming", "Gadgets"],
		isActive: true,
		lastActivity: "2023-10-15T14:48:00.000Z",
		createdAt: "2023-01-10T09:20:00.000Z",
	},
	{
		id: "3FkL9dG7pQ1mR5sZxC8v2",
		name: "Campus Connect",
		description:
			"Anonymous space for university students to ask questions about courses, professors, and campus life.",
		memberCount: 834,
		questionCount: 192,
		tags: ["University", "Education", "Campus"],
		isActive: true,
		lastActivity: "2023-10-16T09:22:00.000Z",
		createdAt: "2023-02-05T11:15:00.000Z",
	},
	{
		id: "7HsT2jK4wP9bN6vX1yZ5m",
		name: "Startup Founders",
		description:
			"A safe space for entrepreneurs to ask sensitive questions about funding, growth, and challenges.",
		memberCount: 521,
		questionCount: 147,
		tags: ["Business", "Startups", "Entrepreneurship"],
		isActive: false,
		lastActivity: "2023-09-30T16:05:00.000Z",
		createdAt: "2023-03-12T15:30:00.000Z",
	},
	{
		id: "2BcV5gH8nM4kR7sW9xZ3p",
		name: "Mental Wellbeing",
		description:
			"Support community for discussing mental health topics anonymously and without judgment.",
		memberCount: 976,
		questionCount: 289,
		tags: ["Health", "Wellness", "Support"],
		isActive: true,
		lastActivity: "2023-10-16T21:34:00.000Z",
		createdAt: "2023-01-15T08:45:00.000Z",
	},
	{
		id: "5Lq9mN3jK7fT2pR8vX4cZ",
		name: "Career Crossroads",
		description:
			"Get anonymous feedback on job offers, salary negotiations, workplace conflicts, and career transitions.",
		memberCount: 1105,
		questionCount: 423,
		tags: ["Career", "Jobs", "Professional"],
		isActive: true,
		lastActivity: "2023-10-17T11:19:00.000Z",
		createdAt: "2023-02-20T14:30:00.000Z",
	},
	{
		id: "9Dt7bV4fG2hJ5mN8wP3qS",
		name: "Creative Corner",
		description:
			"Share your creative projects and get honest feedback from other artists, writers, and designers.",
		memberCount: 687,
		questionCount: 154,
		tags: ["Art", "Design", "Creative"],
		isActive: false,
		lastActivity: "2023-09-25T18:40:00.000Z",
		createdAt: "2023-04-05T10:15:00.000Z",
	},
	{
		id: "4Qs8cR2vT9wX6yZ3nM7kP",
		name: "Parent Hub",
		description:
			"A judgment-free zone for parents to ask questions about parenting challenges, children's behavior, and family dynamics.",
		memberCount: 1456,
		questionCount: 578,
		tags: ["Parenting", "Family", "Children"],
		isActive: true,
		lastActivity: "2023-10-17T08:12:00.000Z",
		createdAt: "2023-01-05T16:20:00.000Z",
	},
	{
		id: "6Wt3zN8xR5cV2mL7bK9jH",
		name: "Fitness Goals",
		description:
			"Share fitness questions, workout routines, nutrition advice, and get motivation from fellow fitness enthusiasts.",
		memberCount: 932,
		questionCount: 267,
		tags: ["Fitness", "Health", "Nutrition"],
		isActive: true,
		lastActivity: "2023-10-16T15:45:00.000Z",
		createdAt: "2023-03-01T12:10:00.000Z",
	},
	{
		id: "1Kp7jH4fT9sR2vN5bM8wZ",
		name: "Book Lovers Anonymous",
		description:
			"Discuss books, authors, and literary themes without worrying about judgment for your reading preferences.",
		memberCount: 734,
		questionCount: 185,
		tags: ["Books", "Reading", "Literature"],
		isActive: true,
		lastActivity: "2023-10-15T19:32:00.000Z",
		createdAt: "2023-02-15T09:40:00.000Z",
	},
	{
		id: "0Gj5hN2pQ8vR4tW7mK3fS",
		name: "Gaming Guild",
		description:
			"Ask questions about games, gaming strategies, equipment, and connect with other gamers anonymously.",
		memberCount: 1870,
		questionCount: 629,
		tags: ["Gaming", "Video Games", "Esports"],
		isActive: true,
		lastActivity: "2023-10-17T02:28:00.000Z",
		createdAt: "2023-01-20T11:30:00.000Z",
	},
	{
		id: "7Zp3xC8vB1nM6kR2fT9qD",
		name: "Relationship Advice",
		description:
			"A supportive space to ask sensitive questions about relationships, dating, and interpersonal dynamics.",
		memberCount: 1325,
		questionCount: 517,
		tags: ["Relationships", "Dating", "Communication"],
		isActive: true,
		lastActivity: "2023-10-17T09:54:00.000Z",
		createdAt: "2023-01-12T13:25:00.000Z",
	},
	{
		id: "2Hs9jN4mP7wQ3bK8vR5zT",
		name: "Culinary Questions",
		description:
			"Ask cooking questions, share recipes, and discuss food-related topics with fellow food enthusiasts.",
		memberCount: 645,
		questionCount: 298,
		tags: ["Cooking", "Food", "Recipes"],
		isActive: false,
		lastActivity: "2023-10-10T14:21:00.000Z",
		createdAt: "2023-03-18T10:05:00.000Z",
	},
];
