"use client";

import { motion } from "framer-motion";

export default function LoadingScreen() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center"
			>
				<div className="relative w-16 h-16 mb-8">
					{/* Wave animation */}
					<motion.div
						className="absolute inset-0 bg-gradient-primary rounded-full opacity-30"
						animate={{
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					{/* Inner circle */}
					<motion.div
						className="absolute inset-2 bg-gradient-primary rounded-full"
						animate={{
							scale: [0.8, 1, 0.8],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.2,
						}}
					/>

					{/* Rotating dots */}
					<motion.div
						className="absolute inset-0"
						animate={{ rotate: 360 }}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "linear",
						}}
					>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								className="absolute w-2 h-2 bg-white rounded-full"
								style={{
									top: "50%",
									left: "50%",
									x: `calc(${Math.cos((i * 2 * Math.PI) / 3) * 30}px - 50%)`,
									y: `calc(${Math.sin((i * 2 * Math.PI) / 3) * 30}px - 50%)`,
								}}
							/>
						))}
					</motion.div>
				</div>

				<motion.p
					className="text-gray-600 dark:text-gray-300"
					animate={{
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				>
					Loading...
				</motion.p>
			</motion.div>
		</div>
	);
}
