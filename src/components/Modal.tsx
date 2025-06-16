// src/components/Modal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaExclamationTriangle,
	FaInfoCircle,
	FaTimes,
	FaSpinner,
} from "react-icons/fa";
import { useModalStore } from "@/store/modalStore";

/**
 * Modal icon configuration based on modal type
 */
const modalConfig = {
	success: {
		icon: FaCheckCircle,
		iconColor: "text-green-500",
		bgColor: "bg-green-50 dark:bg-green-900/20",
		borderColor: "border-green-200 dark:border-green-800",
	},
	error: {
		icon: FaExclamationCircle,
		iconColor: "text-red-500",
		bgColor: "bg-red-50 dark:bg-red-900/20",
		borderColor: "border-red-200 dark:border-red-800",
	},
	warning: {
		icon: FaExclamationTriangle,
		iconColor: "text-yellow-500",
		bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
		borderColor: "border-yellow-200 dark:border-yellow-800",
	},
	info: {
		icon: FaInfoCircle,
		iconColor: "text-blue-500",
		bgColor: "bg-blue-50 dark:bg-blue-900/20",
		borderColor: "border-blue-200 dark:border-blue-800",
	},
	input: {
		icon: FaInfoCircle,
		iconColor: "text-primary",
		bgColor: "bg-primary-50 dark:bg-primary-900/20",
		borderColor: "border-primary-200 dark:border-primary-800",
	},
};

export function Modal() {
	const {
		isOpen,
		type,
		title,
		message,
		inputValue,
		inputError,
		isSubmitting,
		inputLabel,
		inputPlaceholder,
		inputType,
		submitLabel,
		cancelLabel,
		setInputValue,
		submitInput,
		closeModal,
	} = useModalStore();

	const inputRef = useRef<HTMLInputElement>(null);
	const [localInputValue, setLocalInputValue] = useState("");

	const config = modalConfig[type];
	const Icon = config.icon;

	// Sync local input value with store
	useEffect(() => {
		setLocalInputValue(inputValue);
	}, [inputValue]);

	// Focus input when modal opens
	useEffect(() => {
		if (isOpen && type === "input" && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen, type]);

	// Handle keyboard events
	useEffect(() => {
		const handleKeyDown = async (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				closeModal();
			} else if (e.key === "Enter" && type === "input" && !isSubmitting) {
				e.preventDefault();
				await submitInput();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, type, isSubmitting, closeModal, submitInput]);

	// Auto-close success messages after 3 seconds
	useEffect(() => {
		if (isOpen && type === "success") {
			const timer = setTimeout(() => {
				closeModal();
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [isOpen, type, closeModal]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setLocalInputValue(value);
		setInputValue(value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await submitInput();
	};

	return (
		<AnimatePresence mode="wait">
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => !isSubmitting && closeModal()}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
					/>

					{/* Modal */}
					<motion.div
						key={type} // Key change triggers animation on type change
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", duration: 0.3 }}
						className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
					>
						<div
							className={`
                relative max-w-md w-full bg-white dark:bg-gray-800 
                rounded-xl shadow-2xl border-2 ${config.borderColor}
                pointer-events-auto overflow-hidden
              `}
							style={{ letterSpacing: "-0.025em" }}
						>
							{/* Close button */}
							{!isSubmitting && (
								<button
									onClick={closeModal}
									className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 
                           dark:text-gray-500 dark:hover:text-gray-300 
                           transition-colors p-1 rounded-lg hover:bg-gray-100 
                           dark:hover:bg-gray-700 z-10"
									aria-label="Close modal"
								>
									<FaTimes className="w-5 h-5" />
								</button>
							)}

							{/* Content */}
							<div className="p-6">
								{/* Icon and Title */}
								<div className="flex items-start gap-4 mb-4">
									<motion.div
										key={type}
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ type: "spring", duration: 0.3 }}
										className={`p-3 rounded-full ${config.bgColor}`}
									>
										<Icon className={`w-6 h-6 ${config.iconColor}`} />
									</motion.div>
									<div className="flex-1">
										<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
											{title}
										</h3>
										<p className="text-gray-600 dark:text-gray-300">
											{message}
										</p>
									</div>
								</div>

								{/* Input field for input type modal */}
								{type === "input" && (
									<form onSubmit={handleSubmit} className="mt-6">
										<div className="mb-4">
											{inputLabel && (
												<label
													htmlFor="modal-input"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
												>
													{inputLabel}
												</label>
											)}
											<input
												ref={inputRef}
												id="modal-input"
												type={inputType || "text"}
												value={localInputValue}
												onChange={handleInputChange}
												placeholder={inputPlaceholder}
												disabled={isSubmitting}
												className={`
                          w-full px-4 py-2 rounded-lg border-2 
                          ${
														inputError
															? "border-red-500 focus:border-red-500"
															: "border-gray-300 dark:border-gray-600 focus:border-primary"
													}
                          bg-gray-50 dark:bg-gray-900 
                          text-gray-900 dark:text-white
                          placeholder-gray-400 dark:placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-primary/20
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors
                        `}
												style={{ letterSpacing: "-0.025em" }}
											/>
											{inputError && (
												<motion.p
													initial={{ opacity: 0, y: -10 }}
													animate={{ opacity: 1, y: 0 }}
													className="mt-2 text-sm text-red-500"
												>
													{inputError}
												</motion.p>
											)}
										</div>

										{/* Action buttons for input modal */}
										<div className="flex gap-3 justify-end">
											<button
												type="button"
												onClick={closeModal}
												disabled={isSubmitting}
												className="btn-secondary px-6 py-2 disabled:opacity-50"
											>
												{cancelLabel || "Cancel"}
											</button>
											<button
												type="submit"
												disabled={isSubmitting}
												className="btn-primary px-6 py-2 disabled:opacity-50 flex items-center gap-2"
											>
												{isSubmitting && <FaSpinner className="animate-spin" />}
												{submitLabel || "Submit"}
											</button>
										</div>
									</form>
								)}

								{/* Action button for non-input modals */}
								{type !== "input" && (
									<div className="flex justify-end mt-6">
										<button
											onClick={closeModal}
											className="btn-secondary px-6 py-2"
										>
											{type === "error" ? "Try Again" : "Got it"}
										</button>
									</div>
								)}
							</div>

							{/* Auto-close indicator for success messages */}
							{type === "success" && (
								<motion.div
									initial={{ width: "100%" }}
									animate={{ width: "0%" }}
									transition={{ duration: 3, ease: "linear" }}
									className="absolute bottom-0 left-0 h-1 bg-green-500"
								/>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
