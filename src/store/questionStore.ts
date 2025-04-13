import { create } from "zustand";
import { Question } from "@/types/question";

type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionState = {
	questions: Question[];
	isLoading: boolean;
	activeTab: Tab;
	selectedTags: string[];
	setActiveTab: (tab: Tab) => void;
	setSelectedTags: (tags: string[]) => void;
	fetchQuestions: (groupId: string) => Promise<void>;
	addQuestion: (question: Question) => void;
	upvoteQuestion: (questionId: string) => void;
	downvoteQuestion: (questionId: string) => void;
	getQuestionById: (questionId: string) => Question | undefined;
};

export const useQuestionStore = create<QuestionState>((set, get) => ({
	questions: [],
	isLoading: false,
	activeTab: "all",
	selectedTags: [],

	setActiveTab: (tab) => set({ activeTab: tab }),

	setSelectedTags: (tags) => set({ selectedTags: tags }),

	fetchQuestions: async (groupId) => {
		set({ isLoading: true });
		try {
			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock questions data
			const mockQuestions: Question[] = Array.from({ length: 8 }, (_, i) => ({
				id: `question-${i}`,
				groupId,
				title: `Sample question ${i + 1} about design processes?`,
				content:
					"This is a detailed explanation of my question about our design workflow and processes.",
				authorId: i % 3 === 0 ? "current-user" : `user-${i}`,
				authorName: i % 3 === 0 ? "You (Anonymous)" : `Anonymous ${i}`,
				tags: i % 2 === 0 ? ["Design"] : ["Feedback"],
				upvotes: Math.floor(Math.random() * 20),
				downvotes: Math.floor(Math.random() * 5),
				answerCount: Math.floor(Math.random() * 5),
				isAnswered: i % 3 === 0,
				createdAt: new Date(Date.now() - i * 86400000).toISOString(),
			}));

			set({ questions: mockQuestions, isLoading: false });
		} catch (error) {
			console.error("Failed to fetch questions:", error);
			set({ isLoading: false });
		}
	},

	addQuestion: (question) => {
		set((state) => ({
			questions: [question, ...state.questions],
		}));
	},

	upvoteQuestion: (questionId) => {
		set((state) => ({
			questions: state.questions.map((q) =>
				q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
			),
		}));
	},

	downvoteQuestion: (questionId) => {
		set((state) => ({
			questions: state.questions.map((q) =>
				q.id === questionId ? { ...q, downvotes: q.downvotes + 1 } : q
			),
		}));
	},

	getQuestionById: (questionId)  => {
		const state = get();
		return state.questions.find((q)=>q.id===questionId);
	}

}));
