// AiInput.tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { UseFormRegisterReturn } from "react-hook-form";

type AiInputProps = {
	id: string;
	placeholder: string;
	isAiActive: boolean;
	isStreaming: boolean;
	register: UseFormRegisterReturn;
	error?: string;
	className?: string;
};

export default function AiInput({
	id,
	placeholder,
	isAiActive,
	isStreaming,
	register,
	error,
	className = "",
}: Readonly<AiInputProps>) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const { ref, ...rest } = register;

	return (
		<div className="relative">
			<div
				className={`relative rounded-md overflow-hidden ${
					isAiActive || isStreaming ? "ai-input-container" : ""
				}`}
			>
				<input
					id={id}
					ref={(e) => {
						ref(e);
						inputRef.current = e;
					}}
					{...rest}
					placeholder={placeholder}
					className={`input-modern w-full relative z-10 ${
						error ? "input-error" : ""
					} ${isAiActive || isStreaming ? "ai-input-active" : ""} ${className}`}
				/>

				{(isAiActive || isStreaming) && (
					<motion.div
						className="absolute inset-0 input-animated-bg"
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
					<div className="h-2 w-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
				</motion.div>
			)}
		</div>
	);
}
