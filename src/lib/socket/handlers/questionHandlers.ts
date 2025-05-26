import { Socket, Server } from "socket.io";
import { SOCKET_EVENTS } from "../events";
import { emitToGroup } from "../server";
import { Question } from "@/types/schemas/question";

export function handleQuestionEvents(socket: Socket, io: Server | null): void {
	// Listen for question-related events from API routes
	// These will be triggered via server-side emit
}

// Server-side emit functions to be called from API routes
export function broadcastQuestionCreated(
	groupId: string,
	question: Question
): void {
	emitToGroup(groupId, SOCKET_EVENTS.QUESTION_CREATED, {
		groupId,
		question: {
			id: question._id,
			title: question.title,
			content: question.content,
			authorNickname: question.authorNickname,
			tags: question.tags,
			createdAt: question.createdAt,
		},
	});

	// Also emit group activity
	emitToGroup(groupId, SOCKET_EVENTS.GROUP_ACTIVITY, {
		groupId,
		type: "question",
		action: "created",
		timestamp: new Date().toISOString(),
	});
}

export function broadcastQuestionUpdated(
	groupId: string,
	questionId: string,
	updates: Partial<Question> & { updatedAt?: string } // Ensure updatedAt is included
): void {
	emitToGroup(groupId, SOCKET_EVENTS.QUESTION_UPDATED, {
		groupId,
		questionId,
		updates: {
			...updates,
			updatedAt: new Date().toISOString(),
		},
	});
}

export function broadcastQuestionDeleted(
	groupId: string,
	questionId: string
): void {
	emitToGroup(groupId, SOCKET_EVENTS.QUESTION_DELETED, {
		groupId,
		questionId,
	});

	emitToGroup(groupId, SOCKET_EVENTS.GROUP_ACTIVITY, {
		groupId,
		type: "question",
		action: "deleted",
		timestamp: new Date().toISOString(),
	});
}

export function broadcastQuestionVoted(
	groupId: string,
	questionId: string,
	upvotes: number
): void {
	emitToGroup(groupId, SOCKET_EVENTS.QUESTION_VOTED, {
		groupId,
		questionId,
		upvotes,
	});
}
