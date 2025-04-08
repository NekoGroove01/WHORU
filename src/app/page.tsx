"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaUsers } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import { FeatureCard } from "@/components/FeatureCard";
import { staggerContainer, fadeIn } from "@/utils/motion/app";
import { GroupSection } from "@/components/GroupSection";

export default function HomePage() {
	return (
		<main className="min-h-screen">
			{/* Hero Section */}
			<section className="relative h-screen flex items-center overflow-hidden">
				<div className="absolute inset-0 opacity-10 z-0"></div>

				<div className="container mx-auto px-6 z-10 relative">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={staggerContainer}
						className="max-w-3xl"
					>
						<motion.h1 variants={fadeIn} className="mb-6 text-5xl md:text-7xl">
							<span>WHO</span>
							<span className="logo-accent">R</span>
							<span>U</span>
						</motion.h1>

						<motion.p
							variants={fadeIn}
							className="text-xl md:text-2xl mb-8 text-gray-700 dark:text-gray-300"
						>
							Anonymous Q&A platform where questions flow freely and answers
							remain honest, all while keeping identities hidden beneath the
							surface.
						</motion.p>

						<motion.div
							variants={fadeIn}
							className="flex flex-col sm:flex-row gap-4"
						>
							<Link
								href="/create"
								className="btn-primary flex items-center justify-center gap-2"
							>
								Create a Group <FaArrowRight className="text-sm" />
							</Link>
							<Link
								href="/join"
								className="btn-secondary flex items-center justify-center gap-2"
							>
								Join a Group <FaUsers className="text-sm" />
							</Link>
						</motion.div>
					</motion.div>
				</div>

				{/* Animated wave decoration */}
				<motion.div
					className="absolute bottom-0 left-0 w-full h-24 md:h-32 z-0"
					style={{
						background: `url('/images/wave.svg') repeat-x`,
						backgroundSize: "contain",
					}}
					animate={{
						x: [0, -50],
						transition: {
							x: {
								repeat: Infinity,
								repeatType: "loop",
								duration: 20,
								ease: "linear",
							},
						},
					}}
				/>
			</section>

			{/* Group Section */}
			<GroupSection />

			{/* Features Section */}
			<section className="py-20 bg-gray-50 dark:bg-gray-800">
				<div className="container mx-auto px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						variants={staggerContainer}
						className="text-center mb-16"
					>
						<motion.h2 variants={fadeIn} className="mb-4 text-3xl md:text-4xl">
							How It Works
						</motion.h2>
						<motion.p
							variants={fadeIn}
							className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400"
						>
							Ask questions anonymously, create private or public groups, and
							connect with others without revealing your identity.
						</motion.p>
					</motion.div>

					{/* Feature Section */}
					<FeatureCard />
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20">
				<div className="container mx-auto px-6">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-white text-center"
					>
						<motion.h2 variants={fadeIn} className="mb-6 text-3xl md:text-4xl">
							Ready to start asking questions?
						</motion.h2>
						<motion.p variants={fadeIn} className="mb-8 max-w-2xl mx-auto">
							No sign ups. No personal data. Just pure anonymous interaction.
						</motion.p>
						<motion.div
							variants={fadeIn}
							className="flex flex-col sm:flex-row gap-4 justify-center"
						>
							<Link
								href="/browse"
								className="bg-white text-primary px-6 py-3 rounded-lg font-medium text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
							>
								Browse Public Groups <MdOutlinePublic />
							</Link>
							<Link
								href="/create"
								className="border-2 border-white bg-transparent px-6 py-3 rounded-lg font-medium text-lg transition-all hover:bg-white/10 flex items-center justify-center gap-2"
							>
								Create Your Group <FaArrowRight className="text-sm" />
							</Link>
						</motion.div>
					</motion.div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="mt-16 text-center"
					>
						<p className="text-gray-700 dark:text-gray-300 mb-8">
							Contact the WHO{""}
							<span className="text-primary dark:text-primary-light">R</span>U
							teams
						</p>
						<a
							href="/contact"
							className="btn-primary inline-flex items-center hover:opacity-90"
						>
							Contact Support
						</a>
					</motion.div>
				</div>
			</section>

			{/* Footer Section */}
			<footer className="py-10 bg-gray-100 dark:bg-gray-800">
				<div className="container mx-auto px-6 text-center">
					<p className="text-gray-600 dark:text-gray-400">
						&copy; {new Date().getFullYear()} WHO
						<span className="logo-accent">R</span>U. All rights reserved.
					</p>
				</div>
			</footer>
		</main>
	);
}
