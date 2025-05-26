import { Socket, Server } from "socket.io";
import { SOCKET_EVENTS } from "../events";
import { emitToGroup } from "../server";
import { Answer } from "@/types/schemas/answer";

export function handleAnswerEvents(socket: Socket, io: Server | null): void {
	// Listen for answer-related events from API routes
}

// Server-side emit functions
export function broadcastAnswerCreated(
	groupId: string,
	questionId: string,
	answer: Answer
): void {
	emitToGroup(groupId, SOCKET_EVENTS.ANSWER_CREATED, {
		groupId,
		questionId,
		answer: {
			id: answer._id,
			content: answer.content,
			authorNickname: answer.authorNickname,
			createdAt: answer.createdAt,
		},
	});

	emitToGroup(groupId, SOCKET_EVENTS.GROUP_ACTIVITY, {
		groupId,
		type: "answer",
		action: "created",
		timestamp: new Date().toISOString(),
	});
}

export function broadcastAnswerUpdated(
	groupId: string,
	questionId: string,
	answerId: string,
	content: string
): void {
	emitToGroup(groupId, SOCKET_EVENTS.ANSWER_UPDATED, {
		groupId,
		questionId,
		answerId,
		content,
		updatedAt: new Date().toISOString(),
	});
}

export function broadcastAnswerDeleted(
	groupId: string,
	questionId: string,
	answerId: string
): void {
	emitToGroup(groupId, SOCKET_EVENTS.ANSWER_DELETED, {
		groupId,
		questionId,
		answerId,
	});
}

export function broadcastAnswerVoted(
	groupId: string,
	questionId: string,
	answerId: string,
	upvotes: number
): void {
	emitToGroup(groupId, SOCKET_EVENTS.ANSWER_VOTED, {
		groupId,
		questionId,
		answerId,
		upvotes,
	});
}

export function broadcastAnswerAccepted(
	groupId: string,
	questionId: string,
	answerId: string
): void {
	emitToGroup(groupId, SOCKET_EVENTS.ANSWER_ACCEPTED, {
		groupId,
		questionId,
		answerId,
	});
}
