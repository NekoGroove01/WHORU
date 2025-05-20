// src/types/group.ts
export interface Group {
	id: string; // MongoDB _id as string
	name: string;
	description?: string | null; // Can be null if cleared
	isPublic: boolean;
	accessKey?: string; // For private groups, only shown to admin or via join link
	tags: string[];
	questionCount: number; // Denormalized, updated by backend
	lastActivityAt: string; // ISO date string
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	// memberCount is removed as it's not clearly defined how it's tracked without full user accounts.
	// isActive is removed; lastActivityAt is more indicative.
}
