// Conceptual: src/utils/mappers.ts or similar
import type { DbQuestion } from "@/types/schemas/question"; // Adjust path as per your structure
import type { Question as FrontendQuestion } from "@/types/question"; // Adjust path

export function mapDbQuestionToFrontendQuestion(
	dbQuestion: DbQuestion
): FrontendQuestion {
	return {
		id: dbQuestion._id.toHexString(),
		groupId: dbQuestion.groupId.toHexString(),
		title: dbQuestion.title ?? null,
		content: dbQuestion.content,
		authorNickname: dbQuestion.authorNickname,
		tags: dbQuestion.tags ?? [],
		answerCount: dbQuestion.answerCount,
		isAnswered: dbQuestion.isAnswered,
		isResolvedByAsker: dbQuestion.isResolvedByAsker ?? false,
		upvotes: dbQuestion.upvotes,
		// downvotes: dbQuestion.downvotes, // As per your schema, but your frontend type might omit it
		views: dbQuestion.views,
		createdAt: dbQuestion.createdAt.toISOString(),
		updatedAt: dbQuestion.updatedAt.toISOString(),
	};
}
