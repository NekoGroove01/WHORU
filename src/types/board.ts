// types/board.ts
export interface Question {
	id: string;
	content: string;
	nickname: string;
	createdAt: Date;
	upvotes: number;
	answers: Answer[];
	isAnswered: boolean;
}

export interface Answer {
	id: string;
	content: string;
	nickname: string;
	createdAt: Date;
}

export interface Group {
	id: string;
	name: string;
	description: string;
	isPrivate: boolean;
	createdAt: Date;
	questionCount: number;
	memberCount: number;
}

export interface QuestionItemProps {
	question: {
		id: string;
		content: string;
		nickname: string;
		createdAt: Date;
		upvotes: number;
		answers: {
			id: string;
			content: string;
			nickname: string;
			createdAt: Date;
		}[];
	};
}

export interface QuestionListProps {
	groupId: string;
}
