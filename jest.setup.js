// Load test environment variables
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.test" });

// Mock the database collections directly
jest.mock("@/lib/db/collections/groups", () => ({
	GroupsCollection: {
		findPublicGroups: jest.fn(),
		findById: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		verifyAdminPassword: jest.fn(),
		verifyAccessKey: jest.fn(),
	},
}));

jest.mock("@/lib/db/collections/questions", () => ({
	QuestionsCollection: {
		findById: jest.fn(),
		findByGroup: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upvote: jest.fn(),
	},
}));

jest.mock("@/lib/db/collections/answers", () => ({
	AnswersCollection: {
		findById: jest.fn(),
		findByQuestion: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		upvote: jest.fn(),
		acceptAnswer: jest.fn(),
	},
}));

jest.mock("@/lib/db/collections/media", () => ({
	MediaCollection: {
		findById: jest.fn(),
		create: jest.fn(),
		delete: jest.fn(),
		associateWithContent: jest.fn(),
	},
}));

jest.mock("@/lib/db/collections/aiUsageLogs", () => ({
	AIUsageLogsCollection: {
		create: jest.fn(),
		getUsageCount: jest.fn().mockResolvedValue(0),
	},
}));

// Mock Socket.io handlers
jest.mock("@/lib/socket/handlers", () => ({
	broadcastQuestionCreated: jest.fn(),
	broadcastAnswerCreated: jest.fn(),
}));

// Mock AWS S3
jest.mock("@aws-sdk/client-s3", () => ({
	S3Client: jest.fn().mockImplementation(() => ({
		send: jest.fn(),
	})),
	PutObjectCommand: jest.fn(),
	GetObjectCommand: jest.fn(),
	DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
	getSignedUrl: jest.fn().mockResolvedValue("https://mock-url.com"),
}));

// Mock Gemini Service
jest.mock("@/utils/geminiService", () => ({
	generateAnswerStream: jest.fn(),
	generateQuestionsStream: jest.fn(),
	findSimilarQuestions: jest.fn(),
}));
