"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaHome, FaSearch } from "react-icons/fa";

export default function GroupNotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="max-w-md w-full text-center"
			>
				<div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
					<FaSearch className="text-3xl text-red-500" />
				</div>

				<h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
					Group Not Found
				</h1>

				<p className="text-gray-600 dark:text-gray-300 mb-8">
					The group you&apos;re looking for doesn&apos;t exist or may have been
					deleted.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						href="/"
						className="btn-primary flex items-center justify-center gap-2"
					>
						<FaHome /> Back to Home
					</Link>

					<Link
						href="/create"
						className="btn-secondary flex items-center justify-center gap-2"
					>
						Create a Group
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
