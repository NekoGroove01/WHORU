// AIButton.tsx
"use client";

import { motion } from "framer-motion";
import { RiSparklingFill } from "react-icons/ri";

type AIButtonProps = {
	isAiActive: boolean;
	isStreaming: boolean;
	toggleAi: () => void;
};

export default function AiButton({
	isAiActive,
	isStreaming,
	toggleAi,
}: Readonly<AIButtonProps>) {
	return (
		<div className="relative group">
			<motion.button
				type="button"
				onClick={toggleAi}
				disabled={isStreaming}
				whileTap={{ scale: 0.95 }}
				className={`p-2.5 rounded-full transition-all duration-300 overflow-hidden relative`}
				initial={false}
				animate={isAiActive || isStreaming ? "active" : "inactive"}
				variants={{
					inactive: {
						background: "rgb(243, 244, 246)",
						boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
					},
					active: {
						background:
							"linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246), rgb(236, 72, 153))",
						boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
						backgroundSize: "300% 300%",
						transition: {
							backgroundPosition: {
								repeat: Infinity,
								duration: 3,
								ease: "linear",
								from: "0% 0%",
								to: "100% 100%",
							},
						},
					},
				}}
			>
				<motion.div
					variants={{
						inactive: {
							rotate: 0,
							opacity: 0.7,
							scale: 1,
						},
						active: {
							rotate: [0, 15, -15, 0],
							opacity: 1,
							scale: [1, 1.2, 1],
							transition: {
								rotate: {
									repeat: Infinity,
									repeatType: "reverse",
									duration: 1.5,
								},
								scale: {
									repeat: Infinity,
									repeatType: "reverse",
									duration: 1,
								},
							},
						},
					}}
				>
					<RiSparklingFill
						className={`text-lg ${
							isAiActive || isStreaming
								? "text-white"
								: "text-gray-500 dark:text-gray-300"
						}`}
					/>
				</motion.div>

				{(isAiActive || isStreaming) && (
					<motion.div
						className="absolute inset-0 z-[-1] opacity-50"
						initial={{ opacity: 0 }}
						animate={{
							opacity: [0.3, 0.6, 0.3],
							backgroundPosition: ["0% 0%", "100% 100%"],
						}}
						transition={{
							opacity: {
								repeat: Infinity,
								duration: 2,
							},
							backgroundPosition: {
								repeat: Infinity,
								duration: 3,
								ease: "linear",
							},
						}}
						style={{
							background:
								"linear-gradient(135deg, rgba(59, 130, 246, 0.7), rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.7))",
							backgroundSize: "200% 200%",
							filter: "blur(8px)",
						}}
					/>
				)}
			</motion.button>
			{/* tooltip that appears on hover */}
			<div className="absolute z-100 left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
				<div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
					AI Generate
					<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
				</div>
			</div>
		</div>
	);
}
