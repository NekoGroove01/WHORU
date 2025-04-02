// app/not-found.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiHome, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function NotFound() {
	const [mounted, setMounted] = useState(false);
	const [randomIndex, setRandomIndex] = useState(0);

	// Animation only after mounting to prevent hydration issues
	useEffect(() => {
		setMounted(true);
	}, []);

	// Random questions that could lead to a 404
	const randomQuestions = [
		"Who moved this page?",
		"Where did everyone go?",
		"Is anybody here?",
		"Did this group disappear?",
		"Am I in the wrong place?",
	];

	useEffect(() => {
		setRandomIndex(Math.floor(Math.random() * randomQuestions.length));
	}, [randomQuestions.length]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-4 py-10">
			<div className="max-w-md w-full text-center">
				{mounted && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="relative mb-6 sm:mb-8">
							<motion.div
								initial={{ scale: 0.8 }}
								animate={{ scale: [0.8, 1.2, 1] }}
								transition={{ duration: 0.6, times: [0, 0.5, 1] }}
								className="text-[10rem] font-bold leading-none text-gray-200"
							>
								404
							</motion.div>

							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3, duration: 0.5 }}
								className="absolute inset-0 flex items-center justify-center"
							>
								<h1 className="text-4xl font-bold text-[#426EFF] flex items-center justify-center">
									<span>WHO</span>
									<span className="relative">
										R
										<motion.span
											animate={{ rotate: [0, -15, 0, 15, 0] }}
											transition={{
												repeat: Infinity,
												repeatDelay: 4,
												duration: 1.5,
											}}
											className="inline-block"
										>
											U
										</motion.span>
									</span>
									<span>?</span>
								</h1>
							</motion.div>
						</div>

						<h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
							{randomQuestions[randomIndex]}
						</h2>

						<p className="text-gray-600 mb-8 sm:mb-10">
							The page you&apos;re looking for doesn&apos;t exist or might have
							been moved.
						</p>

						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link href="/" className="inline-block w-full">
									<button className="w-full px-6 py-3 rounded-lg bg-[#426EFF] text-white font-medium transition-all hover:shadow-md hover:bg-blue-600 flex items-center justify-center">
										<FiHome className="mr-2" />
										Back to Home
									</button>
								</Link>
							</motion.div>

							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link href="/join" className="inline-block w-full">
									<button className="w-full px-6 py-3 rounded-lg border-2 border-[#426EFF] text-[#426EFF] font-medium transition-all hover:bg-blue-50 flex items-center justify-center">
										<FiSearch className="mr-2" />
										Find Groups
									</button>
								</Link>
							</motion.div>
						</div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
							className="mt-16 text-sm text-gray-500"
						>
							<p>
								Lost? Try creating a{" "}
								<Link href="/create" className="text-[#426EFF] hover:underline">
									new question space
								</Link>
								.
							</p>
						</motion.div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
