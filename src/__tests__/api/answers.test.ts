import { NextRequest } from "next/server";
import { POST } from "@/app/api/answers/route";
import { GET } from "@/app/api/answers/[answerId]/route";
import { AnswersCollection } from "@/lib/db/collections/answers";

jest.mock("@/lib/db/collections/answers");

describe("/api/answers", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/answers", () => {
		it("should create a new answer", async () => {
			const mockAnswer = {
				_id: "a1",
				questionId: "q1",
				groupId: "g1",
				content: "Test answer",
				authorNickname: "Answerer",
				upvotes: 0,
				isAccepted: false,
				createdAt: new Date(),
			};

			(AnswersCollection.create as jest.Mock).mockResolvedValue(mockAnswer);

			const request = new NextRequest("http://localhost:3000/api/answers", {
				method: "POST",
				body: JSON.stringify({
					questionId: "q1",
					groupId: "g1",
					content: "Test answer",
					authorNickname: "Answerer",
					authorPassword: "password123",
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.content).toBe("Test answer");
		});
	});

	describe("GET /api/answers/[answerId]", () => {
		it("should get a specific answer", async () => {
			const mockAnswer = {
				_id: "a1",
				questionId: "q1",
				groupId: "g1",
				content: "Test answer",
				authorNickname: "Answerer",
				upvotes: 5,
				isAccepted: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(AnswersCollection.findById as jest.Mock).mockResolvedValue(mockAnswer);

			const request = new NextRequest("http://localhost:3000/api/answers/a1");
			const response = await GET(request, { params: { answerId: "a1" } });
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.id).toBe("a1");
			expect(data.upvotes).toBe(5);
		});

		it("should return 404 for non-existent answer", async () => {
			// Suppress console.error for this test since we expect an error
			const consoleErrorSpy = jest
				.spyOn(console, "error")
				.mockImplementation(() => {});

			(AnswersCollection.findById as jest.Mock).mockResolvedValue(null);

			const request = new NextRequest(
				"http://localhost:3000/api/answers/invalid"
			);
			const response = await GET(request, { params: { answerId: "invalid" } });
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe("Answer not found");

			// Verify the error was logged (optional)
			expect(consoleErrorSpy).toHaveBeenCalled();

			// Restore console.error
			consoleErrorSpy.mockRestore();
		});
	});
});
