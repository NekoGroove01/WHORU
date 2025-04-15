/**
Here is how to use this component:
<LoadingUI />

// Loading with text
<LoadingUI text="Loading questions..." />

// Small dots animation in gray
<LoadingUI variant="dots" size="sm" color="gray" />

// Large pulsing loader in white (good for dark backgrounds)
<LoadingUI variant="pulse" size="lg" color="white" />

// Full screen overlay loader (for page transitions)
<LoadingUI fullscreen overlay text="Please wait..." />

// Wave animation
<LoadingUI variant="wave" size="md" color="secondary" />

// Inside a card or container
<div className="relative min-h-[200px]">
  <LoadingUI className="absolute inset-0" />
</div>

 */

"use client";

import { motion } from "framer-motion";
import { FaCircleNotch } from "react-icons/fa";

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

/**
 * Reusable loading indicator component
 */
export default function LoadingUI({
	variant = "spinner",
	size = "md",
	color = "primary",
	text,
	fullscreen = false,
	overlay = false,
	className = "",
}: Readonly<LoadingUIProps>) {
	// Size mapping for different components
	const sizeMap = {
		xs: {
			container: "h-4 w-4",
			icon: "text-xs",
			dot: "w-1 h-1",
			text: "text-xs",
		},
		sm: {
			container: "h-6 w-6",
			icon: "text-sm",
			dot: "w-1.5 h-1.5",
			text: "text-sm",
		},
		md: {
			container: "h-8 w-8",
			icon: "text-base",
			dot: "w-2 h-2",
			text: "text-base",
		},
		lg: {
			container: "h-12 w-12",
			icon: "text-xl",
			dot: "w-2.5 h-2.5",
			text: "text-lg",
		},
		xl: {
			container: "h-16 w-16",
			icon: "text-2xl",
			dot: "w-3 h-3",
			text: "text-xl",
		},
	};

	// Color mapping
	const colorMap = {
		primary: "text-primary dark:text-primary-light",
		secondary: "text-accent dark:text-accent-light",
		gray: "text-gray-600 dark:text-gray-300",
		white: "text-white",
	};

	// Container classes based on fullscreen mode
	const containerClasses = fullscreen
		? "fixed inset-0 flex items-center justify-center z-50"
		: "flex items-center justify-center w-full h-full";

	// Overlay classes if enabled
	const overlayClasses =
		overlay && fullscreen
			? "bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm"
			: "";

	// Combined container classes
	const combinedContainerClasses = `${containerClasses} ${overlayClasses} ${className}`;

	// Render the appropriate loading variant
	const renderLoadingIndicator = () => {
		switch (variant) {
			case "spinner":
				return (
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className={`${sizeMap[size].container} ${colorMap[color]}`}
					>
						<FaCircleNotch className={`w-full h-full ${sizeMap[size].icon}`} />
					</motion.div>
				);

			case "dots":
				return (
					<div className={`flex space-x-1 ${colorMap[color]}`}>
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								className={`rounded-full ${sizeMap[size].dot} ${colorMap[color]}`}
								animate={{
									y: ["0%", "-50%", "0%"],
									opacity: [1, 0.5, 1],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: "easeInOut",
									delay: i * 0.2,
								}}
							/>
						))}
					</div>
				);

			case "pulse":
				return (
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							opacity: [1, 0.6, 1],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className={`rounded-full ${sizeMap[size].container} ${colorMap[color]} border-2 border-current`}
					/>
				);

			case "wave":
				return (
					<div className={`flex space-x-1 ${colorMap[color]}`}>
						{[0, 1, 2, 3, 4].map((i) => (
							<motion.div
								key={i}
								className={`w-1 rounded-full ${colorMap[color]}`}
								style={{ height: sizeMap[size].dot.split(" ")[1] }}
								animate={{
									height: [
										sizeMap[size].dot.split(" ")[1],
										sizeMap[size].container.split(" ")[0],
										sizeMap[size].dot.split(" ")[1],
									],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									ease: "easeInOut",
									delay: i * 0.1,
								}}
							/>
						))}
					</div>
				);
		}
	};

	return (
		<output className={combinedContainerClasses} aria-live="polite">
			<div className="flex flex-col items-center">
				{renderLoadingIndicator()}

				{text && (
					<p className={`mt-3 ${colorMap[color]} ${sizeMap[size].text}`}>
						{text}
					</p>
				)}

				<span className="sr-only">Loading...</span>
			</div>
		</output>
	);
}
