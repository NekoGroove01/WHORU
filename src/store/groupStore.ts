import { create } from "zustand";
import { Group } from "@/types/group";
import axios from "axios";

type GroupState = {
	group: Group | null;
	status: "idle" | "loading" | "error";
	setActiveGroup: (group: Group | null) => void;
	fetchGroup: (id: string, accessKey: string | null) => Promise<void>;
	updateGroup: (updatedGroup: Group) => Promise<void>;
	deleteGroup: (id: string, adminPassword: string) => Promise<void>;
};

export const useGroupStore = create<GroupState>((set) => ({
	group: null,
	status: "loading",

	setActiveGroup: (group) => set({ group }),

	fetchGroup: async (id, accessKey) => {
		try {
			// Get group data from API (params: groupId, x-access-key)
			const response = await axios.get(`/api/groups/${id}`, {
				headers: {
					"x-access-key": accessKey ?? "",
				},
			});

			if (!response.data) {
				throw new Error("Group not found");
			}

			const groupData = response.data;
			set({ group: groupData, status: "idle" });
		} catch (error) {
			console.error("Failed to fetch group:", error);
			set({ group: null, status: "error" });
		}
	},

	updateGroup: async (updatedGroup) => {
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

	deleteGroup: async (id, adminPassword) => {
		try {
			const response = await axios.delete(`/api/groups/${id}`, {
				data: { adminPassword },
			});

			if (response.status !== 200) {
				throw new Error("Failed to delete group");
			}

			// Clear the group from the store
			set({ group: null, status: "idle" });

			return Promise.resolve();
		} catch (error) {
			console.error("Failed to delete group:", error);
			set({ status: "error" });
			return Promise.reject(new Error("Failed to delete group"));
		}
	},
}));
