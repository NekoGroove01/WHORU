import axios from "axios";
import { create } from "zustand";
import { Question } from "@/types/question";

export type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionState = {
	questions: Question[];
	question: Question | null;
	isLoading: boolean;
	activeTab: Tab;
	selectedTags: string[];
	error: string | null;
	upvotedQuestions: Set<string>; // Track upvoted questions to prevent duplicates
	setActiveTab: (tab: Tab) => void;
	setSelectedTags: (tags: string[]) => void;
	fetchQuestions: (groupId: string, page?: number) => Promise<void>;
	fetchQuestionById: (questionId: string) => Promise<void>;
	addQuestion: (
		question: Omit<Question, "id" | "createdAt" | "updatedAt">
	) => Promise<void>;
	updateQuestion: (
		question: Pick<Question, "id" | "title" | "content" | "tags">,
		authorPassword: string
	) => Promise<{ success: boolean; error: string | null }>;
	upvoteQuestion: (questionId: string) => Promise<void>;
};

export const useQuestionStore = create<QuestionState>((set, get) => ({
	questions: [],
	question: null,
	isLoading: false,
	activeTab: "all",
	selectedTags: [],
	error: null,
	upvotedQuestions: new Set(),

	setActiveTab: (tab) => set({ activeTab: tab }),

	setSelectedTags: (tags) => set({ selectedTags: tags }),

	// default (page = 1)
	fetchQuestions: async (groupId, page = 1) => {
		set({ isLoading: true });
		try {
			// API call with pagination
			const response = await axios.get(
				`/api/questions/group/${groupId}?page=${page}&limit=20`
			);

			if (response.status !== 200) {
				throw new Error("Failed to fetch questions");
			}
			const questions: Question[] = response.data.questions;

			set({ questions: questions, isLoading: false });
		} catch (error) {
			console.error("Failed to fetch questions:", error);
			set({ isLoading: false });
		}
	},

	fetchQuestionById: async (questionId: string) => {
		set({ isLoading: true });
		try {
			// API call
			const response = await axios.get(`/api/questions/${questionId}`);
			if (response.status !== 200) {
				throw new Error("Failed to fetch question");
			}
			const question: Question = response.data;

			set({
				question: question,
				questions: get().questions.some((q) => q.id === questionId)
					? get().questions
					: [...get().questions, question],
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to fetch question:", error);
			set({ isLoading: false });
		}
	},

	addQuestion: async (question) => {
		try {
			// Make actual API call to create question
			const response = await axios.post("/api/questions", question);

			if (response.status !== 200) {
				throw new Error("Failed to create question");
			}

			const newQuestion: Question = response.data;

			set((state) => ({
				questions: [...state.questions, newQuestion],
				question: newQuestion,
			}));
		} catch (error) {
			console.error("Failed to add question:", error);
			set({ error: "Failed to post your question. Please try again." });
		}
	},

	// Update question with password (id, title, content, tags)
	updateQuestion: async (question, authorPassword) => {
		try {
			// Make API call to update the question
			const response = await axios.put(`/api/questions/${question.id}`, {
				title: question.title,
				content: question.content,
				tags: question.tags,
				authorPassword,
			});

			if (response.status !== 200) {
				throw new Error("Failed to update question");
			}

			const updatedQuestion = response.data;

			// Update local state with the updated question
			set((state) => ({
				questions: state.questions.map((q) => {
					if (q.id !== question.id) return q;

					return {
						...q,
						title: updatedQuestion.title,
						content: updatedQuestion.content,
						tags: updatedQuestion.tags,
						updatedAt: updatedQuestion.updatedAt,
					};
				}),
				// Also update the active question if it matches
				question:
					state.question?.id === question.id
						? {
								...state.question,
								title: updatedQuestion.title,
								content: updatedQuestion.content,
								tags: updatedQuestion.tags,
								updatedAt: updatedQuestion.updatedAt,
						  }
						: state.question,
				error: null,
			}));
			return {
				success: true,
				error: null,
			}; // Indicate success
		} catch (error) {
			console.error("Failed to update question:", error);
			set({ error: "Failed to update question. Please try again." });
			return {
				success: false,
				error: "Failed to update question. Please try again." + error,
			}; // Indicate failure
		}
	},

	upvoteQuestion: async (questionId) => {
		// Check if question has already been upvoted by this user
		const { upvotedQuestions } = get();
		if (upvotedQuestions.has(questionId)) {
			set({ error: "You have already upvoted this question." });
			return;
		}

		try {
			// Make API call to upvote the question
			const response = await axios.post(`/api/questions/${questionId}/upvote`);

			if (response.status !== 200) {
				throw new Error("Failed to upvote question");
			}

			const { upvotes } = response.data;

			// Update local state with the new upvote count
			set((state) => ({
				questions: state.questions.map((q) => {
					if (q.id !== questionId) return q;

					return {
						...q,
						upvotes: upvotes,
					};
				}),
				// Also update the active question if it matches
				question:
					state.question?.id === questionId
						? {
								...state.question,
								upvotes: upvotes,
						  }
						: state.question,
				// Mark this question as upvoted to prevent duplicate votes
				upvotedQuestions: new Set([...state.upvotedQuestions, questionId]),
				error: null,
			}));
		} catch (error) {
			console.error("Failed to upvote question:", error);
			set({ error: "Failed to upvote question. Please try again." });
		}
	},
}));
