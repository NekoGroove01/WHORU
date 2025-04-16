// types/answer.ts
export type Answer = {
	id: string;
	questionId: string;
	content: string;
	authorId: string;
	authorName: string;
	upvotes: number;
	downvotes: number;
	isAccepted: boolean;
	createdAt: string;
};
