import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { staggerContainer, fadeIn } from "@/utils/motion/app";

// Group type definition
type Group = {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	questionCount: number;
	tags: string[];
	isActive: boolean;
};

export function GroupSection() {
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
					<motion.h2 variants={fadeIn} className="mb-4">
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
					{popularGroups.map((group) => {
						return <GroupCard key={group.id} group={group} />;
					})}
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

// Group card component
function GroupCard({ group }: Readonly<{ group: Group }>) {
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

			<div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
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

// Dummy data for popular groups
const popularGroups: Group[] = [
	{
		id: "tech-talk",
		name: "Tech Talk",
		description:
			"Discuss the latest in technology, gadgets, and programming languages. Ask anything from beginner to advanced topics.",
		memberCount: 1248,
		questionCount: 356,
		tags: ["Technology", "Programming", "Gadgets"],
		isActive: true,
	},
	{
		id: "campus-connect",
		name: "Campus Connect",
		description:
			"Anonymous space for university students to ask questions about courses, professors, and campus life.",
		memberCount: 834,
		questionCount: 192,
		tags: ["University", "Education", "Campus"],
		isActive: true,
	},
	{
		id: "startup-founders",
		name: "Startup Founders",
		description:
			"A safe space for entrepreneurs to ask sensitive questions about funding, growth, and challenges.",
		memberCount: 521,
		questionCount: 147,
		tags: ["Business", "Startups", "Entrepreneurship"],
		isActive: false,
	},
	{
		id: "mental-wellbeing",
		name: "Mental Wellbeing",
		description:
			"Support community for discussing mental health topics anonymously and without judgment.",
		memberCount: 976,
		questionCount: 289,
		tags: ["Health", "Wellness", "Support"],
		isActive: true,
	},
	{
		id: "career-advice",
		name: "Career Crossroads",
		description:
			"Get anonymous feedback on job offers, salary negotiations, workplace conflicts, and career transitions.",
		memberCount: 1105,
		questionCount: 423,
		tags: ["Career", "Jobs", "Professional"],
		isActive: true,
	},
	{
		id: "creative-corner",
		name: "Creative Corner",
		description:
			"Share your creative projects and get honest feedback from other artists, writers, and designers.",
		memberCount: 687,
		questionCount: 154,
		tags: ["Art", "Design", "Creative"],
		isActive: false,
	},
];
