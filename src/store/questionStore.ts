import { create } from "zustand";
import { Question } from "@/types/question";
import { nanoid } from "nanoid";

type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionState = {
	questions: Question[];
	question: Question | null;
	isLoading: boolean;
	activeTab: Tab;
	selectedTags: string[];
	error: string | null;
	setActiveTab: (tab: Tab) => void;
	setSelectedTags: (tags: string[]) => void;
	fetchQuestions: (groupId: string) => Promise<void>;
	fetchQuestionById: (questionId: string) => Promise<void>;
	addQuestion: (
		question: Omit<Question, "id" | "createdAt" | "updatedAt">
	) => Promise<void>;
	upvoteQuestion: (questionId: string) => void;
};

export const useQuestionStore = create<QuestionState>((set, get) => ({
	questions: [],
	question: null,
	isLoading: false,
	activeTab: "all",
	selectedTags: [],
	error: null,

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
				authorNickname: `Anonymous${i + 1}`,
				tags: i % 2 === 0 ? ["Design"] : ["Feedback"],
				answerCount: Math.floor(Math.random() * 5),
				isAnswered: Math.random() < 0.5,
				isResolvedByAsker: Math.random() < 0.5,
				upvotes: Math.floor(Math.random() * 20),
				views: Math.floor(Math.random() * 100),
				createdAt: new Date(Date.now() - i * 86400000).toISOString(),
				updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
			}));

			set({ questions: mockQuestions, isLoading: false });
		} catch (error) {
			console.error("Failed to fetch questions:", error);
			set({ isLoading: false });
		}
	},

	fetchQuestionById: async (questionId: string) => {
		set({ isLoading: true });
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 800));

			// Mock question data
			const mockQuestion: Question = {
				id: questionId,
				groupId: "group-id",
				title: "How do we improve the user onboarding experience?",
				content:
					"Our analytics show that many users drop off during the onboarding process. I've noticed that our current onboarding flow has too many steps and might be confusing. What are some ways we could simplify this process while still collecting necessary information? Has anyone experimented with progressive onboarding techniques?",
				authorNickname: "AnonymousUser",
				tags: ["UX", "Onboarding", "Conversion"],
				answerCount: 3,
				isAnswered: true,
				isResolvedByAsker: false,
				upvotes: 24,
				views: 150,
				createdAt: "2024-11-15T10:30:00Z",
				updatedAt: "2024-11-16T12:00:00Z",
			};

			set({
				question: mockQuestion,
				questions: get().questions.some((q) => q.id === questionId)
					? get().questions
					: [...get().questions, mockQuestion],
				isLoading: false,
			});
		} catch (error) {
			console.error("Failed to fetch question:", error);
			set({ isLoading: false });
		}
	},

	addQuestion: async (question) => {
		try {
			await new Promise((resolve) => setTimeout(resolve, 600));
			const newQuestion: Question = {
				...question,
				id: `${nanoid(10)}`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			set((state) => ({
				questions: [...state.questions, newQuestion],
				question: newQuestion,
			}));
			
		} catch (error) {
			console.error("Failed to add question:", error);
			set({ error: "Failed to post your question. Please try again." });
		}
	},

	upvoteQuestion: (questionId) => {
		set((state) => ({
			questions: state.questions.map((q) => {
				if (q.id !== questionId) return q;

				// Found the question we want to update
				return {
					...q,
					upvotes: q.upvotes + 1,
				};
			}),
			// Also update the active question if it matches
			question:
				state.question?.id === questionId
					? {
							...state.question,
							upvotes: state.question.upvotes + 1,
					  }
					: state.question,
		}));
	},
}));
