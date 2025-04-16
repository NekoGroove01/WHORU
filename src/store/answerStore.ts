import { create } from "zustand";
import { nanoid } from "nanoid";
import { Answer } from "@/types/answer";

type AnswerState = {
	answers: Answer[];
	isLoading: boolean;
	error: string | null;
	fetchAnswers: (questionId: string) => Promise<void>;
	addAnswer: (answer: Omit<Answer, "id" | "createdAt">) => Promise<void>;
	upvoteAnswer: (answerId: string) => void;
	downvoteAnswer: (answerId: string) => void;
	acceptAnswer: (answerId: string) => void;
};

export const useAnswerStore = create<AnswerState>((set, get) => ({
	answers: [],
	isLoading: false,
	error: null,

	fetchAnswers: async (questionId: string) => {
		set({ isLoading: true, error: null });
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Mock data
			const mockAnswers: Answer[] = Array.from({ length: 5 }, (_, i) => ({
				id: `answer-${i}`,
				questionId,
				content: `This is a sample answer ${
					i + 1
				}. It explains how to approach the problem described in the question. The explanation includes specific details and examples to make it more helpful.`,
				authorId: `user-${i}`,
				authorName: `Anonymous ${i + 1}`,
				upvotes: Math.floor(Math.random() * 15),
				downvotes: Math.floor(Math.random() * 3),
				isAccepted: i === 0, // First answer is accepted
				createdAt: new Date(Date.now() - i * 3600000).toISOString(),
			}));

			set({ answers: mockAnswers, isLoading: false });
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
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 600));

			const newAnswer: Answer = {
				...answerData,
				id: nanoid(),
				createdAt: new Date().toISOString(),
			};

			set((state) => ({
				answers: [...state.answers, newAnswer],
			}));
		} catch (error) {
			console.error("Failed to add answer:", error);
			set({ error: "Failed to post your answer. Please try again." });
		}
	},

	upvoteAnswer: (answerId) => {
		set((state) => ({
			answers: state.answers.map((answer) =>
				answer.id === answerId
					? { ...answer, upvotes: answer.upvotes + 1 }
					: answer
			),
		}));
	},

	downvoteAnswer: (answerId) => {
		set((state) => ({
			answers: state.answers.map((answer) =>
				answer.id === answerId
					? { ...answer, downvotes: answer.downvotes + 1 }
					: answer
			),
		}));
	},

	acceptAnswer: (answerId) => {
		set((state) => ({
			answers: state.answers.map((answer) => ({
				...answer,
				isAccepted: answer.id === answerId,
			})),
		}));
	},
}));
