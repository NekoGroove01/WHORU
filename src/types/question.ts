// src/types/question.ts
export interface Question {
	id: string; // MongoDB _id as string
	groupId: string;
	title?: string | null; // Title is optional
	content: string;
	authorNickname: string; // Temporary nickname
	tags: string[];
	answerCount: number; // Denormalized
	isAnswered: boolean; // True if an answer is accepted
	isResolvedByAsker?: boolean; // Optional: if asker can mark as resolved
	upvotes: number;
	// downvotes: number; // Removed for simplicity, can be added back if needed
	views: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	// authorId is replaced by authorNickname for anonymity
}
