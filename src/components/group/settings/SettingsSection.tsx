"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

type SettingsSectionProps = {
	title: string;
	icon?: ReactNode;
	children: ReactNode;
	className?: string;
};

export default function SettingsSection({
	title,
	icon,
	children,
	className = "",
}: Readonly<SettingsSectionProps>) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
		>
			<div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
				{icon && <span className="mr-2">{icon}</span>}
				<h3 className="font-medium">{title}</h3>
			</div>
			<div className="p-4">{children}</div>
		</motion.div>
	);
}
