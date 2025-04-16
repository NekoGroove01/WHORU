"use client";

import { motion } from "framer-motion";
import LoadingUI from "./LoadingUI";

type LoadingVariant = "spinner" | "dots" | "pulse" | "wave";
type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";
type LoadingColor = "primary" | "secondary" | "gray" | "white";

interface LoadingUIProps {
	/** Visual style of the loading indicator */
	variant?: LoadingVariant;
	/** Size of the loading indicator */
	size?: LoadingSize;
	/** Color theme of the loading indicator */
	color?: LoadingColor;
	/** Optional text to display with the loading indicator */
	text?: string;
	/** Whether to center the loading indicator on the screen */
	fullscreen?: boolean;
	/** Whether to show a translucent overlay (used with fullscreen) */
	overlay?: boolean;
	/** Additional CSS classes */
	className?: string;
}

export default function LoadingScreen({
	variant = "spinner",
	size = "md",
	color = "primary",
	text,
	fullscreen = false,
	overlay = false,
	className = "",
}: Readonly<LoadingUIProps>) {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex flex-col items-center"
			>
				<div className="relative w-16 h-16 mb-8">
					<LoadingUI 
						variant={variant}
						size={size}
						color={color}
						text={text}
						fullscreen={fullscreen}
						overlay={overlay}
						className={className}
					/>
				</div>
			</motion.div>
		</div>
	);
}
