// app/components/FeatureCard.tsx
"use client";

import { motion } from "framer-motion";
import { FaQuestion, FaLock } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";

interface FeatureCardProps {
	icon: React.ElementType;
	title: string;
	description: string;
	index: number;
}

// Feature list
const features = [
	{
		icon: FaQuestion,
		title: "Anonymous Questions",
		description:
			"Ask anything without revealing your identity. Perfect for sensitive topics or honest feedback.",
	},
	{
		icon: MdOutlinePublic,
		title: "Public & Private Groups",
		description:
			"Create public spaces anyone can join, or private groups with invite-only access.",
	},
	{
		icon: FaLock,
		title: "Complete Privacy",
		description:
			"No registration required. Join with temporary nicknames for added anonymity.",
	},
];

export function FeatureCard() {
	return (
		<div className="grid md:grid-cols-3 gap-10">
			{features.map((feature, index) => (
				<FeatureCardItems
					key={`${index}-${feature.title.slice(0, 5)}`}
					icon={feature.icon}
					title={feature.title}
					description={feature.description}
					index={index}
				/>
			))}
		</div>
	);
}

function FeatureCardItems({
	icon: Icon,
	title,
	description,
	index,
}: Readonly<FeatureCardProps>) {
	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-100px" }}
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: 0.6,
						delay: index * 0.1,
					},
				},
			}}
			className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
		>
			<div className="bg-primary-lighter dark:bg-primary-darker w-14 h-14 rounded-full flex items-center justify-center mb-6 text-white">
				<Icon className="text-2xl" />
			</div>
			<h3 className="mb-3">{title}</h3>
			<p className="text-gray-600 dark:text-gray-400">{description}</p>
		</motion.div>
	);
}
