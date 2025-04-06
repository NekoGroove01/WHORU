// store/boardStore.ts
import { create } from "zustand";
import { nanoid } from "nanoid";
import { Question, Answer, Group } from "../types/board";

interface BoardState {
	// Group data
	group: Group | null;
	loadGroup: (id: string) => void;

	// Questions data
	questions: Question[];
	loadQuestions: (groupId: string) => void;

	// Question actions
	addQuestion: (content: string, nickname: string) => void;
	upvoteQuestion: (questionId: string) => void;
	addAnswer: (questionId: string, content: string, nickname: string) => void;

	// UI state
	isLoading: boolean;
	sortBy: "newest" | "popular" | "unanswered";
	setSortBy: (sort: "newest" | "popular" | "unanswered") => void;
}

// Dummy data for the group
const dummyGroup: Group = {
	id: "group-1",
	name: "JavaScript Enthusiasts",
	description:
		"A place to ask and answer questions about JavaScript and modern web development.",
	isPrivate: false,
	createdAt: new Date("2023-10-15"),
	questionCount: 24,
	memberCount: 156,
};

// Dummy data for questions
const dummyQuestions: Question[] = [
	{
		id: "123abc",
		content: "What's the difference between let, const, and var in JavaScript?",
		nickname: "CuriousCoder",
		createdAt: new Date("2023-10-25T14:32:00"),
		upvotes: 15,
		isAnswered: true,
		answers: [
			{
				id: "a1",
				content:
					"var is function scoped, while let and const are block scoped. const prevents reassignment, while let allows it.",
				nickname: "JSExpert",
				createdAt: new Date("2023-10-25T15:10:00"),
			},
		],
	},
	{
		id: "q2",
		content: "How does React Fiber work under the hood?",
		nickname: "ReactNewbie",
		createdAt: new Date("2023-10-26T09:15:00"),
		upvotes: 8,
		isAnswered: false,
		answers: [],
	},
	{
		id: "q3",
		content:
			"What are the best practices for state management in large Next.js applications?",
		nickname: "ArchitectDev",
		createdAt: new Date("2023-10-27T11:05:00"),
		upvotes: 12,
		isAnswered: true,
		answers: [
			{
				id: "a2",
				content:
					"For large Next.js apps, I recommend using a combination of React Context for UI state, Zustand for global app state, and SWR for server state.",
				nickname: "NextExpert",
				createdAt: new Date("2023-10-27T12:30:00"),
			},
		],
	},
	{
		id: "q4",
		content: "How can I optimize the performance of my React components?",
		nickname: "PerformanceSeeker",
		createdAt: new Date("2023-10-28T16:42:00"),
		upvotes: 7,
		isAnswered: true,
		answers: [
			{
				id: "a3",
				content:
					"Use React.memo for functional components, implement shouldComponentUpdate for class components, and leverage useMemo and useCallback hooks to prevent unnecessary re-renders.",
				nickname: "OptimizationGuru",
				createdAt: new Date("2023-10-28T17:15:00"),
			},
		],
	},
	{
		id: "q5",
		content: "What are the advantages of TypeScript over JavaScript?",
		nickname: "TypeCurious",
		createdAt: new Date("2023-10-29T10:20:00"),
		upvotes: 9,
		isAnswered: false,
		answers: [],
	},
];

export const useBoardStore = create<BoardState>((set) => ({
	// Initial state
	group: null,
	questions: [],
	isLoading: false,
	sortBy: "newest",

	// Load group data (simulated)
	loadGroup: (id: string) => {
		set({ isLoading: true });

		// Simulate API call
		setTimeout(() => {
			set({
				group: dummyGroup,
				isLoading: false,
			});
		}, 500);
	},

	// Load questions (simulated)
	loadQuestions: (groupId: string) => {
		set({ isLoading: true });

		// Simulate API call
		setTimeout(() => {
			set({
				questions: dummyQuestions,
				isLoading: false,
			});
		}, 700);
	},

	// Add a new question
	addQuestion: (content: string, nickname: string) => {
		set((state) => ({
			questions: [
				{
					id: nanoid(),
					content,
					nickname,
					createdAt: new Date(),
					upvotes: 0,
					isAnswered: false,
					answers: [],
				},
				...state.questions,
			],
		}));
	},

	// Upvote a question
	upvoteQuestion: (questionId: string) => {
		set((state) => ({
			questions: state.questions.map((q) =>
				q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
			),
		}));
	},

	// Add an answer to a question
	addAnswer: (questionId: string, content: string, nickname: string) => {
		set((state) => ({
			questions: state.questions.map((q) =>
				q.id === questionId
					? {
							...q,
							isAnswered: true,
							answers: [
								...q.answers,
								{
									id: nanoid(),
									content,
									nickname,
									createdAt: new Date(),
								},
							],
					  }
					: q
			),
		}));
	},

	// Change sorting method
	setSortBy: (sortBy) => set({ sortBy }),
}));
