// Type definitions
export type Group = {
	id: string;
	name: string;
	description: string;
	memberCount: number;
	questionCount: number;
	tags: string[];
	isActive: boolean;
	isPublic?: boolean;
	lastActivity?: string; // ISO date string
	createdAt?: string; // ISO date string
};
