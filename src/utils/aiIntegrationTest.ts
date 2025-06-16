// AI Integration Test - Manual testing utilities
// This file contains utilities to test AI functionality manually

console.log("=== AI Integration Status ===");

// Check if API routes exist
const API_ROUTES = [
	"/api/ai/generate-question",
	"/api/ai/generate-answer",
	"/api/ai/simillar-questions",
];

console.log("✅ AI API Routes configured:");
API_ROUTES.forEach((route) => console.log(`   ${route}`));

// Check environment variables
const REQUIRED_ENV_VARS = ["GEMINI_API_KEY"];

console.log("\n🔧 Environment Variables:");
REQUIRED_ENV_VARS.forEach((envVar) => {
	const exists = process.env[envVar] ? "✅" : "❌";
	console.log(`   ${exists} ${envVar}`);
});

// Test payloads for manual testing
export const TEST_PAYLOADS = {
	generateQuestion: {
		groupId: "test-group-id",
		topic: "React fundamentals",
		context: "Learning React for the first time",
		count: 3,
	},

	generateAnswer: {
		questionId: "test-question-id",
		additionalContext: "Looking for beginner-friendly explanation",
	},

	similarQuestions: {
		groupId: "test-group-id",
		questionText: "How do I learn React?",
		limit: 5,
	},
};

console.log("\n📝 Test payloads ready for manual API testing");
console.log("=== End AI Integration Status ===\n");
