import { NextRequest, NextResponse } from "next/server";
import { GenerateAnswerSchema } from "@/utils/schemas";
import { createGenerateAnswerPrompt } from "@/utils/geminiService";
import { createStreamingResponse } from "@/utils/streamUtils";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = GenerateAnswerSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ message: "Invalid input", errors: validation.error.errors },
				{ status: 400 }
			);
		}

		const { questionContent, context /*, groupId, questionId */ } =
			validation.data;

		const prompt = createGenerateAnswerPrompt(questionContent, context);
		const stream = createStreamingResponse(prompt, request.signal);

		return new NextResponse(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		console.error("[AI Generate Answer Error]:", error);
		if (error instanceof SyntaxError) {
			// JSON parsing error
			return NextResponse.json(
				{ message: "Invalid JSON payload" },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ message: "Internal server error generating answer" },
			{ status: 500 }
		);
	}
}
