// hooks/useBackNavigation.ts
"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useBackNavigation(fallbackPath: string = "/") {
	const router = useRouter();

	const goBack = useCallback(() => {
		// Check if we have history to go back to
		if (window.history.length > 1) {
			router.back();
		} else {
			// If there's no history (e.g., opened directly via URL), go to fallback path
			router.push(fallbackPath);
		}
	}, [router, fallbackPath]);

	return { goBack };
}
