// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
	dir: "./",
});

const customJestConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
	moduleDirectories: ["node_modules", "<rootDir>/"],
	testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

module.exports = createJestConfig(customJestConfig);
