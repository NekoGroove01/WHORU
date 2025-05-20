import { ObjectId } from "mongodb";

interface Question {
  _id: ObjectId;
  groupId: ObjectId; // Reference to Group._id
  title?: string; // Optional, content might be enough
  content: string; // Required
  authorNickname: string; // Temporary nickname, e.g., "Curious Cat"
  // For question management (edit/delete/accept answer)
  // Option A: Specific password per question
  managementPasswordHash?: string; // bcrypt hash, if Qs have individual passwords
  // Option B: Managed by group admin (preferred for simplicity if "almost no login" means avoiding many micro-passwords)
  // Option C: Temporary edit token (see Authentication section)
  tags?: string[]; // Subset of group tags or user-defined
  answerCount: number; // Default: 0, denormalized
  isAnswered: boolean; // Default: false (true if an answer is accepted)
  isResolvedByAsker?: boolean; // Default: false
  upvotes: number; // Default: 0
  downvotes: number; // Default: 0 (Consider if needed, or just upvotes)
  views: number; // Default: 0
  createdAt: Date;
  updatedAt: Date;
}