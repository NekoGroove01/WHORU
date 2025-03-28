// app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiUsers, FiLock, FiMessageSquare } from "react-icons/fi";
import { useState } from "react";

export default function Home() {
	const [hoverButton, setHoverButton] = useState<string | null>(null);

	const features = [
		{
			icon: <FiUsers className="w-6 h-6 text-[#426EFF]" />,
			title: "Anonymous Interaction",
			description:
				"Ask questions and provide answers without revealing your identity.",
		},
		{
			icon: <FiLock className="w-6 h-6 text-[#426EFF]" />,
			title: "Public & Private Groups",
			description:
				"Create open communities or closed groups with invitation-only access.",
		},
		{
			icon: <FiMessageSquare className="w-6 h-6 text-[#426EFF]" />,
			title: "Real-time Updates",
			description:
				"Watch as new questions and answers appear instantly in your groups.",
		},
	];

	return (
		<main className="min-h-screen flex flex-col">
			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center px-6 py-28 md:py-32 text-center bg-gradient-to-b from-white to-blue-50">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="max-w-4xl mx-auto"
				>
					<h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
						WHO<span className="text-[#426EFF]">R</span>U
					</h1>
					<p className="text-xl md:text-2xl text-gray-700 mb-14 max-w-2xl mx-auto">
						Ask questions freely. Get honest answers anonymously. No identities,
						just genuine conversations.
					</p>

					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onMouseEnter={() => setHoverButton("create")}
							onMouseLeave={() => setHoverButton(null)}
						>
							<Link href="/create" className="inline-block">
								<button className="px-8 py-4 rounded-lg bg-[#426EFF] text-white font-medium text-lg transition-all hover:shadow-lg hover:bg-blue-600">
									Create a Group
								</button>
							</Link>
						</motion.div>

						<motion.div
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onMouseEnter={() => setHoverButton("join")}
							onMouseLeave={() => setHoverButton(null)}
						>
							<Link href="/join" className="inline-block">
								<button className="px-8 py-4 rounded-lg border-2 border-[#426EFF] text-[#426EFF] font-medium text-lg transition-all hover:bg-blue-50">
									Join Existing Group
								</button>
							</Link>
						</motion.div>
					</div>
				</motion.div>
			</section>

			{/* Features Section */}
			<section className="py-24 md:py-28 px-6 bg-white">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

					<div className="grid md:grid-cols-3 gap-10">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className="p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="mb-6 p-4 rounded-full bg-blue-50 inline-block">
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
								<p className="text-gray-600">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 md:py-28 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-3xl font-bold mb-8">
							Ready to start the conversation?
						</h2>
						<p className="text-lg text-gray-700 mb-12">
							Create your first question space and invite others to join. No
							sign-up required, just genuine anonymous interactions.
						</p>

						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Link href="/create" className="inline-block">
								<button className="px-10 py-4 rounded-lg bg-[#426EFF] text-white font-medium text-lg transition-all hover:shadow-lg hover:bg-blue-600">
									Get Started Now
								</button>
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-8 px-6 bg-gray-50">
				<div className="max-w-6xl mx-auto text-center text-gray-500">
					<p>© {new Date().getFullYear()} WHORU. All rights reserved.</p>
				</div>
			</footer>
		</main>
	);
}
