import { create } from "zustand";
import { Group } from "@/types/group";

type GroupState = {
	group: Group | null;
	setActiveGroup: (group: Group | null) => void;
	fetchGroup: (id: string) => Promise<void>;
	updateGroup: (updatedGroup: Group) => Promise<void>;
	deleteGroup: (id: string) => Promise<void>;
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

	updateGroup: async (updatedGroup: Group) => {
		try {
			// In a real app, this would be an API call
			// For now, we'll simulate an update with a delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Update the group in the store
			set({ group: updatedGroup });

			return Promise.resolve();
		} catch (error) {
			console.error("Failed to update group:", error);
			return Promise.reject(new Error("Failed to update group"));
		}
	},

	deleteGroup: async (id: string) => {
		try {
			// In a real app, this would be an API call
			// For now, we'll simulate a delete with a delay
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Clear the group from the store
			set({ group: null });

			return Promise.resolve();
		} catch (error) {
			console.error("Failed to delete group:", error);
			return Promise.reject(new Error("Failed to delete group"));
		}
	},
}));
