// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";
import { motion } from "framer-motion";

export const ThemeToggle: React.FC = () => {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<motion.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200"
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
		>
			{theme === "dark" ? (
				<FiSun className="w-5 h-5 text-[#1488CC]" />
			) : (
				<FiMoon className="w-5 h-5 text-[#0466C8]" />
			)}
		</motion.button>
	);
};
