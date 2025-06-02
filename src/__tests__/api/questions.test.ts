import { NextRequest } from "next/server";
import { POST } from "@/app/api/questions/route";
import { QuestionsCollection } from "@/lib/db/collections/questions";
import { broadcastQuestionCreated } from "@/lib/socket/handlers";

jest.mock("@/lib/db/collections/questions");

describe("/api/questions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/questions", () => {
		it("should create a new question and broadcast", async () => {
			const mockQuestion = {
				_id: "q1",
				groupId: "g1",
				title: "Test Question",
				content: "Test content",
				authorNickname: "TestUser",
				tags: ["test"],
				answerCount: 0,
				isAnswered: false,
				upvotes: 0,
				views: 0,
				createdAt: new Date(),
			};

			(QuestionsCollection.create as jest.Mock).mockResolvedValue(mockQuestion);

			const request = new NextRequest("http://localhost:3000/api/questions", {
				method: "POST",
				body: JSON.stringify({
					groupId: "g1",
					title: "Test Question",
					content: "Test content",
					authorNickname: "TestUser",
					authorPassword: "password123",
					tags: ["test"],
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.title).toBe("Test Question");
			expect(broadcastQuestionCreated).toHaveBeenCalledWith("g1", mockQuestion);
		});

		it("should handle validation errors", async () => {
			const request = new NextRequest("http://localhost:3000/api/questions", {
				method: "POST",
				body: JSON.stringify({
					// Missing required fields
					title: "Test Question",
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBeDefined();
		});
	});
});
