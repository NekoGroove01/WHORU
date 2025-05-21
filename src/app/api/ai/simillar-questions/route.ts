import { NextRequest, NextResponse } from "next/server";
import { SimilarQuestionsSchema } from "@/utils/schemas";
import { createSimilarQuestionsPrompt } from "@/utils/geminiService"; // Adjusted path
import { createStreamingResponse } from "@/utils/streamUtils"; // Adjusted path
// import { connectToDatabase } from "@/utils/mongodb"; // If you need to fetch existing questions for context

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = SimilarQuestionsSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid input", errors: validation.error.errors },
				{ status: 400 }
			);
		}

		const { currentQuestionContent /*, groupId, currentQuestionId */ } =
			validation.data;

		// Optional: Fetch other questions from the group for better context
		// let existingQuestionsContext = "";
		// if (groupId) {
		//     const { db } = await connectToDatabase();
		//     const otherQuestions = await db.collection("questions")
		//         .find({ groupId: new ObjectId(groupId), _id: { $ne: new ObjectId(currentQuestionId) } })
		//         .limit(5) // Get a few for context
		//         .project({ title: 1, content: 1 })
		//         .toArray();
		//     existingQuestionsContext = otherQuestions.map(q => q.title || q.content.substring(0,100)).join("\n---\n");
		// }

		const prompt = createSimilarQuestionsPrompt(
			currentQuestionContent /*, existingQuestionsContext */
		);
		const stream = createStreamingResponse(prompt, request.signal);

		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8", // Or application/octet-stream
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		console.error("[AI Similar Questions Error]:", error);
		if (error instanceof SyntaxError) {
			// JSON parsing error
			return NextResponse.json(
				{ message: "Invalid JSON payload" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Internal server error generating similar questions" },
			{ status: 500 }
		);
	}
}
