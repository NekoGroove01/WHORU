export type Question = {
	id: string;
	groupId: string;
	title: string;
	content: string;
	authorId: string;
	authorName: string;
	tags: string[];
	upvotes: number;
	downvotes: number;
	answerCount: number;
	isAnswered: boolean;
	createdAt: string;
};
