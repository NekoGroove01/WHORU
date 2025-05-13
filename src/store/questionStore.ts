// store/questionStore.ts
import { create } from "zustand";
import { Question } from "@/types/question";

type Tab = "all" | "popular" | "recent" | "mine" | "unanswered";

type QuestionState = {
	questions: Question[];
	question: Question | null;
	isLoading: boolean;
	activeTab: Tab;
	selectedTags: string[];
	setActiveTab: (tab: Tab) => void;
	setSelectedTags: (tags: string[]) => void;
	fetchQuestions: (groupId: string) => Promise<void>;
	fetchQuestionById: (questionId: string) => Promise<void>;
	addQuestion: (question: Question) => void;
	upvoteQuestion: (
		questionId: string,
		previousVote: "up" | "down" | null
	) => void;
	downvoteQuestion: (
		questionId: string,
		previousVote: "up" | "down" | null
	) => void;
};

export const useQuestionStore = create<QuestionState>((set, get) => ({
	questions: [],
	question: null,
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
				authorId: "user-123",
				authorName: "Anonymous Raccoon",
				tags: ["UX", "Onboarding", "Conversion"],
				upvotes: 24,
				downvotes: 2,
				answerCount: 5,
				isAnswered: true,
				createdAt: "2023-11-15T10:30:00Z",
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

	addQuestion: (question) => {
		set((state) => ({
			questions: [question, ...state.questions],
		}));
	},

	upvoteQuestion: (questionId, previousVote) => {
		set((state) => ({
			questions: state.questions.map((q) => {
				if (q.id !== questionId) return q;

				// Found the question we want to update
				const updatedQuestion = { ...q };

				// Cancel previous vote if exists
				if (previousVote === "down") {
					updatedQuestion.downvotes = Math.max(
						0,
						updatedQuestion.downvotes - 1
					);
				}

				// Add new upvote
				updatedQuestion.upvotes += 1;

				return updatedQuestion;
			}),
			// Also update the active question if it matches
			question:
				state.question?.id === questionId
					? {
							...state.question,
							upvotes: state.question.upvotes + 1,
							downvotes:
								previousVote === "down"
									? Math.max(0, state.question.downvotes - 1)
									: state.question.downvotes,
					  }
					: state.question,
		}));
	},

	downvoteQuestion: (questionId, previousVote) => {
		set((state) => ({
			questions: state.questions.map((q) => {
				if (q.id !== questionId) return q;

				// Found the question we want to update
				const updatedQuestion = { ...q };

				// Cancel previous vote if exists
				if (previousVote === "up") {
					updatedQuestion.upvotes = Math.max(0, updatedQuestion.upvotes - 1);
				}

				// Add new downvote
				updatedQuestion.downvotes += 1;

				return updatedQuestion;
			}),
			// Also update the active question if it matches
			question:
				state.question?.id === questionId
					? {
							...state.question,
							downvotes: state.question.downvotes + 1,
							upvotes:
								previousVote === "up"
									? Math.max(0, state.question.upvotes - 1)
									: state.question.upvotes,
					  }
					: state.question,
		}));
	},
}));
