"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaQuestion, FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";

interface Bubble {
	id: number;
	size: number;
	left: string;
	animationDuration: number;
	initialDelay: number;
}

export default function NotFound() {
	const [bubbles, setBubbles] = useState<Array<Bubble>>([]);

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5 },
		},
	};

	// Bubbles animation
	// Generate bubbles only on the client side to avoid hydration mismatch
	useEffect(() => {
		const generatedBubbles = Array.from({ length: 10 }).map((_, i) => ({
			id: i,
			size: Math.random() * 40 + 10,
			left: `${Math.random() * 100}%`,
			animationDuration: Math.random() * 10 + 5,
			initialDelay: Math.random() * 5,
		}));
		setBubbles(generatedBubbles);
	}, []);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-primary-darkest to-primary-darker text-white px-4">
			{/* Animated background bubbles */}
			{bubbles.map((bubble) => (
				<motion.div
					key={bubble.id}
					className="absolute rounded-full bg-white/10"
					style={{
						width: bubble.size,
						height: bubble.size,
						left: bubble.left,
						bottom: -bubble.size,
					}}
					initial={{ y: 0, opacity: 0.3 }}
					animate={{
						y: [0, -1000],
						opacity: [0.3, 0],
					}}
					transition={{
						duration: bubble.animationDuration,
						repeat: Infinity,
						delay: bubble.initialDelay,
						ease: "linear",
					}}
				/>
			))}

			{/* Content container */}
			<motion.div
				className="relative z-10 max-w-xl w-full text-center my-22 md:my-0"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Error code */}
				<motion.div
					variants={itemVariants}
					className="text-9xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-lightest to-accent-light"
				>
					404
				</motion.div>

				{/* Error message */}
				<motion.h1
					variants={itemVariants}
					className="text-3xl md:text-4xl font-bold mb-4"
				>
					Page Not Found
				</motion.h1>

				<motion.p
					variants={itemVariants}
					className="text-lg text-gray-200 mb-8"
				>
					Seems like this page has drifted into the deep blue sea. Let&apos;s
					get you back to safer waters.
				</motion.p>

				{/* Navigation options */}
				<motion.div
					variants={itemVariants}
					className="bg-white/10 backdrop-blur-md rounded-2xl p-12 mb-8"
				>
					<h2 className="text-xl font-semibold mb-4">
						Where would you like to go?
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<Link
							href="/"
							className="flex flex-col items-center p-4 rounded-lg hover:bg-white/10 transition-colors"
						>
							<FaHome className="text-2xl mb-2" />
							<span className="">Home</span>
						</Link>

						<Link
							href="/join"
							className="flex flex-col items-center p-4 rounded-lg hover:bg-white/10 transition-colors"
						>
							<FaUsers className="text-2xl mb-2" />
							<span>Join a Group</span>
						</Link>

						<Link
							href="/create"
							className="flex flex-col items-center p-4 rounded-lg hover:bg-white/10 transition-colors"
						>
							<FaQuestion className="text-2xl mb-2" />
							<span>Create a Group</span>
						</Link>
					</div>
				</motion.div>

				{/* Back button */}
				<motion.div variants={itemVariants}>
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-white/30 hover:bg-white/10 transition-colors"
					>
						← Go Back
					</button>
				</motion.div>
			</motion.div>
		</div>
	);
}
