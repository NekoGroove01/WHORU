"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AiButton from "@/components/ui/AIButton";
import AIModal from "@/components/ui/AIModal";

export default function AIDemoPage() {
	const [isAiActive] = useState(false);
	const [isStreaming] = useState(false);
	const [isAIModalOpen, setIsAIModalOpen] = useState(false);

	const toggleAi = () => {
		setIsAIModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
			<div className="max-w-4xl mx-auto px-4">
				<motion.div
					className="text-center mb-12"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
						AI Modal <span className="logo-accent">Demo</span>
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Experience our AI-powered features with an intuitive modal interface
					</p>
				</motion.div>

				<motion.div
					className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
								AI Assistant Features
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								Click the AI button to explore our three powerful AI functions
							</p>
						</div>
						<AiButton
							isAiActive={isAiActive}
							isStreaming={isStreaming}
							toggleAi={toggleAi}
						/>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						<div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
							<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
								<span className="text-white text-xl">❓</span>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Generate Questions
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								AI creates thoughtful questions based on your topic or context
							</p>
						</div>

						<div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
							<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
								<span className="text-white text-xl">💭</span>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Generate Answers
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								AI provides detailed, well-structured answers to your questions
							</p>
						</div>

						<div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-700">
							<div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
								<span className="text-white text-xl">🔍</span>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
								Find Similar Questions
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								AI discovers questions similar to yours for better insights
							</p>
						</div>
					</div>

					<div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
						<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
							How to use:
						</h4>
						<ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
							<li>1. Click the AI button (sparkle icon) above</li>
							<li>2. Choose one of the three AI functions</li>
							<li>3. Notice the context section with pre-filled information</li>
							<li>
								4. Enter additional input if needed (optional when context is
								provided)
							</li>
							<li>5. Click the generate button to see AI in action</li>
						</ol>
						<div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
							<p className="text-xs text-blue-800 dark:text-blue-300">
								<strong>Smart Context:</strong> The AI modal automatically
								receives relevant context - group names for questions, question
								content for answers, making AI suggestions more accurate.
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					className="text-center mt-8"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<p className="text-gray-500 dark:text-gray-400">
						This is a demo interface. API integration will be implemented in
						future updates.
					</p>
				</motion.div>
			</div>

			{/* AI Modal */}
			<AIModal
				isOpen={isAIModalOpen}
				onClose={() => setIsAIModalOpen(false)}
				precontent="This is a demo group for testing AI functionality"
				groupId="demo-group-id"
				questionId="demo-question-id"
			/>
		</div>
	);
}
