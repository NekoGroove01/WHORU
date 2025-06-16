import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { staggerContainer, fadeIn } from "@/utils/basicMotion";
import { GroupCard } from "@/components/browse/GroupCard";
import type { Group } from "@/types/group";
import axios from "axios";

export function GroupSection() {
	// State management for groups data
	const [groups, setGroups] = useState<Group[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch popular groups on component mount
	useEffect(() => {
		const fetchPopularGroups = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Fetch first 6 public groups (most popular)
				const response = await axios.get("/api/groups", {
					params: {
						page: 1,
						limit: 6,
					},
				});

				// Assuming the API returns { groups: Group[], total: number, page: number, limit: number }
				setGroups(response.data.groups ?? []);
			} catch (err) {
				console.error("Error fetching popular groups:", err);
				setError(err instanceof Error ? err.message : "Failed to load groups");
			} finally {
				setIsLoading(false);
			}
		};

		fetchPopularGroups();
	}, []);

	// Loading state
	if (isLoading) {
		return (
			<section className="py-20 bg-white dark:bg-gray-900 relative">
				<div className="container mx-auto px-6">
					<div className="text-center mb-12">
						<h2 className="mb-4 text-3xl md:text-4xl font-semibold">
							Popular Groups
						</h2>
						<p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
							Loading active Q&A spaces...
						</p>
					</div>

					{/* Loading skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[...Array(6)].map((_, index) => (
							<div
								key={index}
								className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 animate-pulse"
							/>
						))}
					</div>
				</div>
			</section>
		);
	}

	// Error state
	if (error) {
		return (
			<section className="py-20 bg-white dark:bg-gray-900 relative">
				<div className="container mx-auto px-6">
					<div className="text-center">
						<h2 className="mb-4 text-3xl md:text-4xl font-semibold">
							Popular Groups
						</h2>
						<p className="text-red-500 dark:text-red-400 mb-8">{error}</p>
						<button
							onClick={() => window.location.reload()}
							className="btn-secondary"
						>
							Try Again
						</button>
					</div>
				</div>
			</section>
		);
	}

	// Empty state
	if (groups.length === 0) {
		return (
			<section className="py-20 bg-white dark:bg-gray-900 relative">
				<div className="container mx-auto px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						variants={staggerContainer}
						className="text-center"
					>
						<motion.h2
							variants={fadeIn}
							className="mb-4 text-3xl md:text-4xl font-semibold"
						>
							No Groups Yet
						</motion.h2>
						<motion.p
							variants={fadeIn}
							className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 mb-8"
						>
							Be the first to create a Q&A space and start the conversation.
						</motion.p>
						<motion.div variants={fadeIn}>
							<Link
								href="/create"
								className="btn-primary inline-flex items-center"
							>
								Create First Group <FaArrowRight className="ml-2" />
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>
		);
	}

	// Main render with fetched groups
	return (
		<section className="py-20 bg-white dark:bg-gray-900 relative">
			<div className="container mx-auto px-6">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={staggerContainer}
					className="text-center mb-12"
				>
					<motion.h2
						variants={fadeIn}
						className="mb-4 text-3xl md:text-4xl font-semibold"
					>
						Popular Groups
					</motion.h2>
					<motion.p
						variants={fadeIn}
						className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400"
					>
						Discover active Q&A spaces or create your own to start the
						conversation.
					</motion.p>
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={fadeIn}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{groups.map((group) => (
						<GroupCard key={group.id} group={group} />
					))}
				</motion.div>

				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					whileHover={{ y: -5, transition: { duration: 0.2 } }}
					variants={fadeIn}
					className="text-center"
				>
					<Link
						href="/browse"
						className="btn-secondary inline-flex items-center mt-12"
					>
						Browse All Groups <FaArrowRight className="ml-2" />
					</Link>
				</motion.div>
			</div>

			{/* Gradient fade overlay at bottom */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
		</section>
	);
}
