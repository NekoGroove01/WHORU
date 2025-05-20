// src/types/answer.ts
export interface Answer {
	id: string; // MongoDB _id as string
	questionId: string;
	groupId: string; // For context, denormalized
	content: string;
	authorNickname: string; // Temporary nickname
	upvotes: number;
	// downvotes: number; // Removed for simplicity
	isAccepted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	// authorId is replaced by authorNickname
}
