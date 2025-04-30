// AiTextarea.tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { UseFormRegisterReturn } from "react-hook-form";

type AiTextareaProps = {
	id: string;
	placeholder: string;
	isAiActive: boolean;
	isStreaming: boolean;
	register: UseFormRegisterReturn;
	error?: string;
	minRows?: number;
	maxRows?: number;
	className?: string;
};

export default function AiTextarea({
	id,
	placeholder,
	isAiActive,
	isStreaming,
	register,
	error,
	minRows = 3,
	maxRows = 15,
	className = "",
}: Readonly<AiTextareaProps>) {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const { ref, ...rest } = register;

	return (
		<div className="relative">
			<div
				className={`relative rounded-md overflow-hidden ${
					isAiActive || isStreaming ? "ai-textarea-container" : ""
				}`}
			>
				<TextareaAutosize
					id={id}
					ref={(e) => {
						ref(e);
						textareaRef.current = e;
					}}
					{...rest}
					placeholder={placeholder}
					minRows={minRows}
					maxRows={maxRows}
					className={`textarea-modern w-full relative z-10 ${
						error ? "input-error" : ""
					} ${
						isAiActive || isStreaming ? "ai-textarea-active" : ""
					} ${className}`}
				/>

				{(isAiActive || isStreaming) && (
					<motion.div
						className="absolute inset-0 textarea-animated-bg"
						animate={{
							rotate: [0, 360],
							scale: [1, 1.05, 1],
						}}
						transition={{
							rotate: {
								repeat: Infinity,
								duration: 15,
								ease: "linear",
							},
							scale: {
								repeat: Infinity,
								duration: 3,
								ease: "easeInOut",
							},
						}}
					/>
				)}
			</div>

			{error && <p className="mt-1 text-sm text-red-500">{error}</p>}

			{isStreaming && (
				<motion.div
					className="absolute bottom-3 right-3 z-20"
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						repeat: Infinity,
						duration: 1.5,
					}}
				>
					<div className="h-3 w-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
				</motion.div>
			)}
		</div>
	);
}
