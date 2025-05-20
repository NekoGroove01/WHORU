import { ObjectId } from "mongodb";

// src/types/answer.ts (ensure this matches or update it)
interface Answer {
	_id: ObjectId;
	questionId: ObjectId; // Reference to Question._id
	groupId: ObjectId; // Reference to Group._id (for context/scoping)
	content: string; // Required
	authorNickname: string; // Temporary nickname
	// For answer management (edit/delete)
	// Option A: Specific password per answer
	managementPasswordHash?: string; // bcrypt hash
	// Option B: Managed by group admin or question asker
	// Option C: Temporary edit token
	upvotes: number; // Default: 0
	downvotes: number; // Default: 0
	isAccepted: boolean; // Default: false (set by question asker/group admin)
	createdAt: Date;
	updatedAt: Date;
}
