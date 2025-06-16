// answerStore.ts
import axios from "axios";
import { create } from "zustand";
import { Answer } from "@/types/answer";

interface AnswerData {
	questionId: string;
	content: string;
	authorNickname: string;
	authorPassword: string;
	mediaIds?: string[];
}

type AnswerState = {
	answers: Answer[];
	isLoading: boolean;
	error: string | null;
	fetchAnswers: (questionId: string, page?: number) => Promise<void>;
	addAnswer: (
		answer: AnswerData
	) => Promise<{ success: boolean; error: string | null }>;
	updateAnswer: (
		answerId: string,
		content: string,
		authorPassword: string
	) => Promise<{ success: boolean; error: string | null }>;
	deleteAnswer: (
		answerId: string,
		authorPassword: string
	) => Promise<{ success: boolean; error: string | null }>;
	upvoteAnswer: (answerId: string) => void;
	acceptAnswer: (answerId: string) => void;
	// API methods for real-time operations
	upvoteAnswerAPI: (
		answerId: string
	) => Promise<{ success: boolean; error: string | null }>;
	acceptAnswerAPI: (
		answerId: string,
		questionId: string,
		questionAuthorPassword: string
	) => Promise<{ success: boolean; error: string | null }>;
	// Real-time update methods for Socket.IO
	addAnswerRealtime: (answer: Answer) => void;
	updateAnswerRealtime: (answerId: string, content: string) => void;
	deleteAnswerRealtime: (answerId: string) => void;
	voteAnswerRealtime: (answerId: string, upvotes: number) => void;
	acceptAnswerRealtime: (answerId: string) => void;
};

export const useAnswerStore = create<AnswerState>((set) => ({
	answers: [],
	isLoading: false,
	error: null,

	fetchAnswers: async (questionId: string, page = 1) => {
		set({ isLoading: true, error: null });
		try {
			// API call
			const response = await axios.get(
				`/api/answers/question/${questionId}?=page=${page}&limit=10`
			);

			if (!response.data.answers || !Array.isArray(response.data.answers)) {
				throw new Error("Invalid response format");
			}

			const newAnswers = response.data.answers;

			set({ answers: newAnswers, isLoading: false });
		} catch (error) {
			console.error("Failed to fetch answers:", error);
			set({
				error: "Failed to load answers. Please try again.",
				isLoading: false,
			});
		}
	},

	addAnswer: async (answerData) => {
		try {
			// API call
			const response = await axios.post("/api/answers", answerData);

			if (response.status !== 200 || !response.data) {
				throw new Error("Invalid response format");
			}

			const newAnswer: Answer = response.data;

			set((state) => ({
				answers: [...state.answers, newAnswer],
			}));
			return { success: true, error: null };
		} catch (error) {
			console.error("Failed to add answer:", error);
			set({ error: "Failed to post your answer. Please try again." });
			return {
				success: false,
				error: error instanceof Error ? error.message : "Post failed",
			};
		}
	},

	updateAnswer: async (answerId, content, authorPassword) => {
		try {
			// API call
			const response = await axios.put(`/api/answers/${answerId}`, {
				content,
				authorPassword,
			});

			if (response.status !== 200) {
				throw new Error(response.data.error || "Update failed");
			}

			set((state) => ({
				answers: state.answers.map((answer) =>
					answer.id === answerId ? { ...answer, content } : answer
				),
			}));

			return { success: true, error: null };
		} catch (error) {
			console.error("Failed to update answer:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update answer. Please try again.";
			set({
				error: errorMessage,
			});
			return {
				success: false,
				error: error instanceof Error ? error.message : "Update failed",
			};
		}
	},

	deleteAnswer: async (answerId: string, authorPassword: string) => {
		try {
			const response = await axios.delete(`/api/answers/${answerId}`, {
				data: { authorPassword },
			});

			if (response.status !== 200) {
				throw new Error(response.data.error || "Delete failed");
			}

			set((state) => ({
				answers: state.answers.filter((answer) => answer.id !== answerId),
			}));

			return { success: true, error: null };
		} catch (error) {
			console.error("Failed to delete answer:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to delete answer. Please try again.";
			set({ error: errorMessage });
			return {
				success: false,
				error: error instanceof Error ? error.message : "Delete failed",
			};
		}
	},

	upvoteAnswer: (answerId) => {
		set((state) => {
			// Find the answer to ensure it exists
			const answerExists = state.answers.some(
				(answer) => answer.id === answerId
			);

			if (!answerExists) {
				console.debug(`Answer with id ${answerId} not found`);
				return state;
			}

			return {
				answers: state.answers.map((answer) =>
					answer.id === answerId
						? { ...answer, upvotes: answer.upvotes + 1 }
						: answer
				),
			};
		});
	},

	acceptAnswer: (answerId) => {
		set((state) => ({
			answers: state.answers.map((answer) => ({
				...answer,
				isAccepted: answer.id === answerId,
			})),
		}));
	},

	// API methods for real-time operations
	upvoteAnswerAPI: async (answerId) => {
		try {
			// Immediately update local state for instant feedback
			set((state) => {
				const answerExists = state.answers.some(
					(answer) => answer.id === answerId
				);

				if (!answerExists) {
					console.debug(`Answer with id ${answerId} not found`);
					return state;
				}

				return {
					answers: state.answers.map((answer) =>
						answer.id === answerId
							? { ...answer, upvotes: answer.upvotes + 1 }
							: answer
					),
				};
			});

			const response = await axios.post(`/api/answers/${answerId}/vote`, {
				voteType: "upvote",
			});

			if (response.status !== 200) {
				// Revert the optimistic update on API failure
				set((state) => ({
					answers: state.answers.map((answer) =>
						answer.id === answerId
							? { ...answer, upvotes: answer.upvotes - 1 }
							: answer
					),
				}));
				throw new Error("Vote failed");
			}

			return { success: true, error: null };
		} catch (error) {
			console.error("Failed to vote on answer:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to vote. Please try again.";
			set({ error: errorMessage });
			return {
				success: false,
				error: error instanceof Error ? error.message : "Vote failed",
			};
		}
	},

	acceptAnswerAPI: async (answerId, questionId, questionAuthorPassword) => {
		try {
			const response = await axios.post(
				`/api/questions/${questionId}/accept-answer`,
				{
					answerId,
					questionAuthorPassword,
				}
			);

			if (response.status !== 200) {
				throw new Error(response.data.error || "Accept failed");
			}

			return { success: true, error: null };
		} catch (error) {
			console.error("Failed to accept answer:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to accept answer. Please try again.";
			set({ error: errorMessage });
			return {
				success: false,
				error: error instanceof Error ? error.message : "Accept failed",
			};
		}
	},

	// Real-time update methods for Socket.IO
	addAnswerRealtime: (answer) => {
		set((state) => ({
			answers: [...state.answers, answer],
		}));
	},

	updateAnswerRealtime: (answerId, content) => {
		set((state) => ({
			answers: state.answers.map((answer) =>
				answer.id === answerId
					? { ...answer, content, updatedAt: new Date().toISOString() }
					: answer
			),
		}));
	},

	deleteAnswerRealtime: (answerId) => {
		set((state) => ({
			answers: state.answers.filter((answer) => answer.id !== answerId),
		}));
	},

	voteAnswerRealtime: (answerId, upvotes) => {
		set((state) => ({
			answers: state.answers.map((answer) =>
				answer.id === answerId ? { ...answer, upvotes } : answer
			),
		}));
	},

	acceptAnswerRealtime: (answerId) => {
		set((state) => ({
			answers: state.answers.map((answer) => ({
				...answer,
				isAccepted: answer.id === answerId,
			})),
		}));
	},
}));
