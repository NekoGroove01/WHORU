// app/join/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import CodeJoinForm from "../../components/join/JoinForm";
import GroupBrowser from "../../components/join/GroupBrowser";

export default function JoinGroup() {
	const [joinMode, setJoinMode] = useState<"code" | "browse">("code");

	// Function to handle successful join
	const handleSuccessfulJoin = (groupId: string) => {
		// Redirect to the group (this is just a placeholder)
		window.location.href = `/group/${encodeURIComponent(groupId)}`;
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-6 sm:py-8 px-4 sm:px-6">
			<div className="max-w-xl mx-auto">
				<Link
					href="/"
					className="inline-flex items-center text-gray-600 hover:text-[#426EFF] mb-4 sm:mb-6 text-sm sm:text-base transition-colors"
				>
					<FiArrowLeft className="mr-2" /> Back to home
				</Link>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-white rounded-xl shadow-md p-6 sm:p-8"
				>
					<h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
						Join a Question Space
					</h1>
					<p className="text-gray-600 mb-6 text-sm sm:text-base">
						Enter a group code or browse public groups to start asking questions
						anonymously.
					</p>

					{/* Toggle between direct join and browse */}
					<div className="flex mb-6 border border-gray-200 rounded-lg p-1">
						<button
							onClick={() => setJoinMode("code")}
							className={`flex-1 py-2 px-3 rounded-md text-sm sm:text-base font-medium transition-colors ${
								joinMode === "code"
									? "bg-[#426EFF] text-white"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							Enter Code
						</button>
						<button
							onClick={() => setJoinMode("browse")}
							className={`flex-1 py-2 px-3 rounded-md text-sm sm:text-base font-medium transition-colors ${
								joinMode === "browse"
									? "bg-[#426EFF] text-white"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							Browse Groups
						</button>
					</div>

					{joinMode === "code" ? (
						<CodeJoinForm onSuccessfulJoin={handleSuccessfulJoin} />
					) : (
						<GroupBrowser onSelectGroup={handleSuccessfulJoin} />
					)}
				</motion.div>

				<div className="text-center mt-4 text-gray-500 text-xs sm:text-sm">
					<p>
						Don&apos;t see what you&apos;re looking for?{" "}
						<Link href="/create" className="text-[#426EFF] hover:underline">
							Create a new group
						</Link>
					</p>
				</div>
			</div>
		</main>
	);
}
