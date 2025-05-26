import { useEffect, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import { initializeSocket, joinGroup, leaveGroup } from "@/utils/socketClient";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { useQuestionStore } from "@/store/questionStore";
import { useAnswerStore } from "@/store/answerStore";

// 소켓 이벤트 데이터 타입 정의
interface QuestionCreatedData {
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

interface QuestionUpdatedData {
	questionId: string;
	updates: {
		title?: string | null;
		content?: string;
		tags?: string[];
	};
}

interface QuestionDeletedData {
	questionId: string;
}

interface AnswerCreatedData {
	questionId: string;
	answer: {
		id: string;
		content: string;
		authorNickname: string;
		createdAt: string;
	};
}

interface AnswerAcceptedData {
	questionId: string;
	answerId: string;
}

// 소켓 이벤트 맵 타입
interface SocketEventMap {
	[SOCKET_EVENTS.QUESTION_CREATED]: QuestionCreatedData;
	[SOCKET_EVENTS.QUESTION_UPDATED]: QuestionUpdatedData;
	[SOCKET_EVENTS.QUESTION_DELETED]: QuestionDeletedData;
	[SOCKET_EVENTS.ANSWER_CREATED]: AnswerCreatedData;
	[SOCKET_EVENTS.ANSWER_ACCEPTED]: AnswerAcceptedData;
}

// 클라이언트에서 서버로 보내는 이벤트 타입
interface ClientToServerEvents {
	[key: string]: unknown;
	// 필요한 이벤트들을 여기에 추가
}

// useSocket 옵션
interface UseSocketOptions {
	groupId?: string;
	onConnect?: () => void;
	onDisconnect?: () => void;
}

export function useSocket(options: UseSocketOptions = {}) {
	const { groupId, onConnect, onDisconnect } = options;
	const socketRef = useRef<Socket | null>(null);
	const questionStore = useQuestionStore();
	const answerStore = useAnswerStore();

	// Initialize socket and event listeners
	useEffect(() => {
		socketRef.current = initializeSocket();
		const socket = socketRef.current;

		if (onConnect) {
			socket.on("connect", onConnect);
		}

		if (onDisconnect) {
			socket.on("disconnect", onDisconnect);
		}

		// Question event handlers with proper typing
		const handleQuestionCreated = (data: QuestionCreatedData) => {
			if (data.groupId === groupId) {
				questionStore.addQuestion({
					groupId: data.groupId,
					title: data.question.title,
					content: data.question.content,
					authorNickname: data.question.authorNickname,
					tags: data.question.tags,
					answerCount: 0,
					isAnswered: false,
					isResolvedByAsker: false,
					upvotes: 0,
					views: 0,
				});
			}
		};

		const handleQuestionUpdated = (data: QuestionUpdatedData) => {
			const questions = questionStore.questions.map((q) =>
				q.id === data.questionId ? { ...q, ...data.updates } : q
			);
			questionStore.questions = questions;
		};

		const handleQuestionDeleted = (data: QuestionDeletedData) => {
			const questions = questionStore.questions.filter(
				(q) => q.id !== data.questionId
			);
			questionStore.questions = questions;
		};

		const handleAnswerCreated = (data: AnswerCreatedData) => {
			if (questionStore.question?.id === data.questionId) {
				answerStore.addAnswer({
					questionId: data.questionId,
					content: data.answer.content,
					authorNickname: data.answer.authorNickname,
					upvotes: 0,
					isAccepted: false,
				});
			}
		};

		const handleAnswerAccepted = (data: AnswerAcceptedData) => {
			if (data.questionId === questionStore.question?.id) {
				answerStore.acceptAnswer(data.answerId);
			}
		};

		// Register event handlers
		socket.on(SOCKET_EVENTS.QUESTION_CREATED, handleQuestionCreated);
		socket.on(SOCKET_EVENTS.QUESTION_UPDATED, handleQuestionUpdated);
		socket.on(SOCKET_EVENTS.QUESTION_DELETED, handleQuestionDeleted);
		socket.on(SOCKET_EVENTS.ANSWER_CREATED, handleAnswerCreated);
		socket.on(SOCKET_EVENTS.ANSWER_ACCEPTED, handleAnswerAccepted);

		// Cleanup
		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off(SOCKET_EVENTS.QUESTION_CREATED, handleQuestionCreated);
			socket.off(SOCKET_EVENTS.QUESTION_UPDATED, handleQuestionUpdated);
			socket.off(SOCKET_EVENTS.QUESTION_DELETED, handleQuestionDeleted);
			socket.off(SOCKET_EVENTS.ANSWER_CREATED, handleAnswerCreated);
			socket.off(SOCKET_EVENTS.ANSWER_ACCEPTED, handleAnswerAccepted);
		};
	}, [answerStore, groupId, onConnect, onDisconnect, questionStore]);

	// Join/leave group
	useEffect(() => {
		if (groupId && socketRef.current?.connected) {
			joinGroup(groupId);

			return () => {
				leaveGroup(groupId);
			};
		}
	}, [groupId]);

	// Type-safe emit function with overloads
	const emit = useCallback(
		<K extends keyof ClientToServerEvents>(
			event: K,
			data: ClientToServerEvents[K]
		) => {
			if (socketRef.current?.connected) {
				socketRef.current.emit(event as string, data);
			}
		},
		[]
	);

	// Alternative: Generic emit for flexibility
	const emitGeneric = useCallback(<T = unknown>(event: string, data: T) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(event, data);
		}
	}, []);

	return {
		socket: socketRef.current,
		isConnected: socketRef.current?.connected || false,
		emit,
		emitGeneric, // 필요한 경우 사용
	};
}

// 사용 예시
/** 
const { emit } = useSocket({ groupId: "123" });

타입 안전한 emit
emit("someEvent", { data: "value" }); // ClientToServerEvents에 정의된 경우

또는 generic emit 사용
emitGeneric<{ message: string }>("customEvent", { message: "Hello" });
*/
