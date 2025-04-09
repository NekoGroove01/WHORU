import { create } from "zustand";
import { Group } from "@/types/group";

type GroupState = {
	group: Group | null;
	setActiveGroup: (group: Group | null) => void;
	fetchGroup: (id: string) => Promise<void>;
};

export const useGroupStore = create<GroupState>((set) => ({
	group: null,

	setActiveGroup: (group) => set({ group }),

	fetchGroup: async (id) => {
		try {
			// In a real app, this would be an API call
			// For now, we'll simulate a fetch with a delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Mock group data - in real app this would come from API
			const mockGroup: Group = {
				id,
				name: "Design Team Feedback",
				description:
					"Anonymous Q&A space for our design team to share thoughts and feedback",
				memberCount: 25,
				questionCount: 12,
				tags: ["Design", "UI/UX", "Feedback", "Product", "Research"],
				isActive: true,
				lastActivity: new Date().toISOString(),
				createdAt: "2023-09-15T10:00:00Z",
			};

			set({ group: mockGroup });
		} catch (error) {
			console.error("Failed to fetch group:", error);
			set({ group: null });
		}
	},
}));
