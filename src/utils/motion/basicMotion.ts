// animations/main.ts

import { Transition } from "@headlessui/react";

// Animation variants
export const fadeIn = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4 },
	},
};

export const pageVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

export const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
		},
	},
};

export const showContainer = {
	hidden: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0.3,
		},
	},
	visible: {
		opacity: 1,
		height: "auto",
		transition: {
			duration: 0.3,
			staggerChildren: 0.1, // 자식 요소들이 순차적으로 나타남
		},
	},
};

export const showContainerChildren = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.3 },
	},
};
