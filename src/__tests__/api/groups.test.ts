import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/groups/route";
import { GroupsCollection } from "@/lib/db/collections/groups";

// Mock the collections
jest.mock("@/lib/db/collections/groups");

describe("/api/groups", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /api/groups", () => {
		it("should return public groups with pagination", async () => {
			const mockGroups = [
				{
					_id: "1",
					name: "Test Group",
					description: "Test Description",
					tags: ["test"],
					questionCount: 5,
					lastActivityAt: new Date(),
					createdAt: new Date(),
				},
			];

			(GroupsCollection.findPublicGroups as jest.Mock).mockResolvedValue({
				groups: mockGroups,
				total: 1,
			});

			const request = new NextRequest(
				"http://localhost:3000/api/groups?page=1&limit=20"
			);
			const response = await GET(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.groups).toHaveLength(1);
			expect(data.pagination).toEqual({
				page: 1,
				limit: 20,
				total: 1,
				totalPages: 1,
			});
		});
	});

	describe("POST /api/groups", () => {
		it("should create a new group", async () => {
			const mockGroup = {
				_id: "1",
				name: "New Group",
				description: "New Description",
				isPublic: true,
				accessKey: "test-key",
				tags: ["new"],
				questionCount: 0,
				lastActivityAt: new Date(),
				createdAt: new Date(),
			};

			(GroupsCollection.create as jest.Mock).mockResolvedValue(mockGroup);

			const request = new NextRequest("http://localhost:3000/api/groups", {
				method: "POST",
				body: JSON.stringify({
					name: "New Group",
					description: "New Description",
					isPublic: true,
					tags: ["new"],
					adminPassword: "password123",
				}),
			});

			const response = await POST(request);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.name).toBe("New Group");
			expect(data.accessKey).toBe("test-key");
		});
	});
});
