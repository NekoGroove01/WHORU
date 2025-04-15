"use client";

import { Fragment, ReactNode } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

type ConfirmDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string | ReactNode;
	confirmText?: string;
	cancelText?: string;
	confirmStyle?: "primary" | "danger" | "warning";
};

export default function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmStyle = "primary",
}: Readonly<ConfirmDialogProps>) {
	if (!isOpen) return null;

	// Handle button style based on the confirmStyle prop
	const getButtonStyle = () => {
		switch (confirmStyle) {
			case "danger":
				return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
			case "warning":
				return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
			case "primary":
			default:
				return "bg-primary hover:bg-primary-dark focus:ring-primary";
		}
	};

	// Animation variants
	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	const dialogVariants = {
		hidden: { opacity: 0, scale: 0.95, y: -20 },
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 500,
			},
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: 20,
			transition: {
				duration: 0.2,
			},
		},
	};

	return (
		<Fragment>
			{/* Backdrop */}
			<motion.div
				initial="hidden"
				animate="visible"
				exit="hidden"
				variants={overlayVariants}
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto"
				onClick={onClose}
			>
				{/* Dialog */}
				<motion.div
					initial="hidden"
					animate="visible"
					exit="exit"
					variants={dialogVariants}
					className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
						<div className="flex items-center">
							{confirmStyle === "danger" && (
								<FaExclamationTriangle className="text-red-500 mr-2" />
							)}
							<h3 className="font-medium text-lg">{title}</h3>
						</div>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
						>
							<FaTimes />
						</button>
					</div>

					{/* Body */}
					<div className="px-4 py-4">
						<div className="text-gray-600 dark:text-gray-300">
							{typeof message === "string" ? <p>{message}</p> : message}
						</div>
					</div>

					{/* Footer */}
					<div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
						<button
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
						>
							{cancelText}
						</button>
						<button
							onClick={() => {
								onConfirm();
								onClose();
							}}
							className={`px-4 py-2 rounded-md text-white ${getButtonStyle()} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
						>
							{confirmText}
						</button>
					</div>
				</motion.div>
			</motion.div>
		</Fragment>
	);
}
