import { useCallback } from "react";

export const useAccessKey = () => {
	const getAccessKey = useCallback((groupId: string): string | null => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(`group_access_${groupId}`);
	}, []);

	const setAccessKey = useCallback(
		(groupId: string, accessKey: string): void => {
			if (typeof window === "undefined") return;
			localStorage.setItem(`group_access_${groupId}`, accessKey);
		},
		[]
	);

	const removeAccessKey = useCallback((groupId: string): void => {
		if (typeof window === "undefined") return;
		localStorage.removeItem(`group_access_${groupId}`);
	}, []);

	const hasAccessKey = useCallback(
		(groupId: string): boolean => {
			return getAccessKey(groupId) !== null;
		},
		[getAccessKey]
	);

	return {
		getAccessKey,
		setAccessKey,
		removeAccessKey,
		hasAccessKey,
	};
};
