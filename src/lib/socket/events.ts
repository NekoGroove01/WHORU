// Socket event type definitions
export const SOCKET_EVENTS = {
	// Connection events
	CONNECT: "connect",
	DISCONNECT: "disconnect",

	// Group events
	JOIN_GROUP: "join_group",
	LEAVE_GROUP: "leave_group",
	GROUP_ACTIVITY: "group_activity",

	// Question events
	QUESTION_CREATED: "question_created",
	QUESTION_UPDATED: "question_updated",
	QUESTION_DELETED: "question_deleted",
	QUESTION_VOTED: "question_voted",

	// Answer events
	ANSWER_CREATED: "answer_created",
	ANSWER_UPDATED: "answer_updated",
	ANSWER_DELETED: "answer_deleted",
	ANSWER_VOTED: "answer_voted",
	ANSWER_ACCEPTED: "answer_accepted",

	// Error events
	ERROR: "error",
} as const;

// Event payload types
export interface JoinGroupPayload {
	groupId: string;
}

export interface QuestionCreatedPayload {
	groupId: string;
	question: {
		id: string;
		title: string | null;
		content: string;
		authorNickname: string;
		tags: string[];
		createdAt: string;
	};
}

export interface QuestionUpdatedPayload {
	groupId: string;
	questionId: string;
	updates: {
		title?: string | null;
		content?: string;
		tags?: string[];
		updatedAt: string;
	};
}

export interface QuestionDeletedPayload {
	groupId: string;
	questionId: string;
}

export interface QuestionVotedPayload {
	groupId: string;
	questionId: string;
	upvotes: number;
}

export interface AnswerCreatedPayload {
	groupId: string;
	questionId: string;
	answer: {
		id: string;
		content: string;
		authorNickname: string;
		createdAt: string;
	};
}

export interface AnswerUpdatedPayload {
	groupId: string;
	questionId: string;
	answerId: string;
	content: string;
	updatedAt: string;
}

export interface AnswerDeletedPayload {
	groupId: string;
	questionId: string;
	answerId: string;
}

export interface AnswerVotedPayload {
	groupId: string;
	questionId: string;
	answerId: string;
	upvotes: number;
}

export interface AnswerAcceptedPayload {
	groupId: string;
	questionId: string;
	answerId: string;
}

export interface GroupActivityPayload {
	groupId: string;
	type: "question" | "answer";
	action: "created" | "updated" | "deleted";
	timestamp: string;
}
