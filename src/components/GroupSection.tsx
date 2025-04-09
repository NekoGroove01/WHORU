import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { staggerContainer, fadeIn } from "@/utils/motion/app";
import { GroupCard } from "@/components/browse/GroupCard";

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

// Dummy data for popular groups
const popularGroups: Group[] = [
	{
		id: "8Fn2JgUWUn57lPGk7L2b3",
		name: "Tech Talk",
		description:
			"Discuss the latest in technology, gadgets, and programming languages. Ask anything from beginner to advanced topics.",
		memberCount: 1248,
		questionCount: 356,
		tags: ["Technology", "Programming", "Gadgets"],
		isActive: true,
	},
	{
		id: "k9mT6PwR3sZvE2xH7yA4f",
		name: "Campus Connect",
		description:
			"Anonymous space for university students to ask questions about courses, professors, and campus life.",
		memberCount: 834,
		questionCount: 192,
		tags: ["University", "Education", "Campus"],
		isActive: true,
	},
	{
		id: "D4qV7xFbG2eN9rMj3kL5s",
		name: "Startup Founders",
		description:
			"A safe space for entrepreneurs to ask sensitive questions about funding, growth, and challenges.",
		memberCount: 521,
		questionCount: 147,
		tags: ["Business", "Startups", "Entrepreneurship"],
		isActive: false,
	},
	{
		id: "p1bY6cXnT5gH8jQ2rS3zD",
		name: "Mental Wellbeing",
		description:
			"Support community for discussing mental health topics anonymously and without judgment.",
		memberCount: 976,
		questionCount: 289,
		tags: ["Health", "Wellness", "Support"],
		isActive: true,
	},
	{
		id: "W3mZ5aB9cE7fG4hJ6dK2v",
		name: "Career Crossroads",
		description:
			"Get anonymous feedback on job offers, salary negotiations, workplace conflicts, and career transitions.",
		memberCount: 1105,
		questionCount: 423,
		tags: ["Career", "Jobs", "Professional"],
		isActive: true,
	},
	{
		id: "R5tY8uN2mP4qL7sV9xC3b",
		name: "Creative Corner",
		description:
			"Share your creative projects and get honest feedback from other artists, writers, and designers.",
		memberCount: 687,
		questionCount: 154,
		tags: ["Art", "Design", "Creative"],
		isActive: false,
	},
];
