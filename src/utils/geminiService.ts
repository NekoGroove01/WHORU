import { GoogleGenAI, Content } from "@google/genai";
import { Question } from "@/types/schemas/question";

// Initialize Gemini client (기존과 동일)
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
	console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const genAI = new GoogleGenAI({
	apiKey: API_KEY,
});
// --- 변경하지 않음: 기존 모델명 'gemini-2.5-flash-preview-05-20'을 그대로 유지 ---
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// Token estimation constants (기존과 동일)
const CHARS_PER_TOKEN = 4;
const COST_PER_TOKEN = 0.000001;

interface GeminiResponse {
	text: string;
	tokensUsed: number;
	cost: number;
}

// Non-streaming response handler (기존과 동일)
async function generateGeminiResponse(
	prompt: string | Content | Content[]
): Promise<GeminiResponse> {
	if (!genAI) {
		throw new Error("Gemini API client not initialized");
	}

	try {
		let contents: Content[];
		if (typeof prompt === "string") {
			contents = [{ role: "user", parts: [{ text: prompt }] }];
		} else if (Array.isArray(prompt)) {
			contents = prompt;
		} else {
			contents = [prompt];
		}

		const response = await genAI.models.generateContent({
			model: MODEL_NAME,
			contents,
			config: {
				temperature: 0.7,
				topP: 0.95,
				maxOutputTokens: 2048,
			},
		});

		const text = response.text;
		if (!text) {
			throw new Error("No response text received from Gemini API");
		}

		// Calculate tokens and cost (기존 방식 유지)
		const tokensUsed = Math.ceil(text.length / CHARS_PER_TOKEN);
		const cost = tokensUsed * COST_PER_TOKEN;

		return { text, tokensUsed, cost };
	} catch (error) {
		console.error("Gemini generation error:", error);
		throw error instanceof Error ? error : new Error("Unknown error");
	}
}

// --- UPGRADE: 프롬프트 생성 함수 분리 및 내용 개선 ---
// 기존의 `createGenerateAnswerPrompt`, `createSimilarQuestionsPrompt`를 대체하는 통합 함수
function createPrompt(
	purpose: "generateQuestions" | "generateAnswer" | "findSimilarQuestions",
	topic: string,
	context?: string,
	details?: { count?: number; existingQuestionsContext?: string }
): string {
	const userInstructions = context
		? `**가장 중요한 사용자 지시사항 (최우선으로 반영할 것):**\n${context}`
		: "";

	switch (purpose) {
		case "generateQuestions":
			return `**역할:** 당신은 특정 주제에 대해 깊이 있고 통찰력 있는 질문을 생성하는 전문가입니다.
**주제:** "${topic}"
**생성할 질문 수:** ${details?.count}개

${userInstructions}

**기본 지침:**
1. 개방형 질문을 만드세요. 질문은 명확하고 간결해야 합니다.
2. 주제의 언어와 동일한 언어로 질문을 생성하세요.
3. 아래 예시와 같이 번호 목록 형식으로만 답변하세요.

**[예시 1]**
주제: "JavaScript Closures"
사용자 지시사항: "초보자를 위한 내용으로"
결과:
1. 클로저(Closure)란 무엇이며, 왜 자바스크립트에서 중요한 개념인가요?
2. 클로저가 실제로 사용되는 간단한 코드 예시를 보여줄 수 있나요?
3. 클로저를 사용할 때 발생할 수 있는 메모리 누수 문제점은 무엇인가요?

**[예시 2]**
주제: "React State Management"
사용자 지시사항: "대규모 애플리케이션에 초점을 맞춰서"
결과:
1. 대규모 애플리케이션에서 Redux나 MobX 없이 React Context API만 사용하는 것의 한계는 무엇인가요?
2. Recoil이나 Jotai 같은 원자적(atomic) 상태 관리 모델이 기존 Flux 아키텍처에 비해 갖는 장점은 무엇인가요?
3. 서버 상태와 클라이언트 상태를 분리하여 관리하는 것이 왜 중요하며, 이를 위한 모범 사례는 무엇인가요?

**[당신의 차례]**
**주제:** "${topic}"
${context ? `**사용자 지시사항:** ${context}\n` : ""}
**당신의 질문:**`;

		case "generateAnswer":
			return `**역할:** 당신은 복잡한 질문에 대해 명확하고 구조적인 답변을 제공하는 지식 전문가입니다.
**질문:**
${topic}

${userInstructions}

**기본 지침:**
1. 질문의 핵심을 정확히 파악하여 답변하세요.
2. 답변은 이해하기 쉬운 언어로 작성하고, 필요하다면 예시를 포함하세요.
3. 질문과 동일한 언어로 답변하세요.

**[예시 1]**
질문: "자바스크립트의 이벤트 루프가 뭔가요?"
사용자 지시사항: "10살 아이도 이해할 수 있게 설명해줘."
결과:
자바스크립트의 이벤트 루프는 식당의 웨이터와 같아요!
1. **주문 받기(Task Queue):** 손님들이 '이것 좀 해주세요'라고 요청하면, 웨이터는 주문서에 차곡차곡 적어둬요.
2. **요리사에게 전달(Call Stack):** 웨이터는 주방이 한가할 때마다 주문을 하나씩 가져가 요리사에게 전달해요.
3. **요리 완료:** 요리사는 한 번에 하나의 요리만 할 수 있어요. 요리가 끝나면 다음 주문을 받죠.
이벤트 루프는 이 과정을 계속 반복하면서 모든 주문을 처리하고 식당이 멈추지 않게 해주는 아주 중요한 역할이에요!

**[예시 2]**
질문: "Title: SQL vs NoSQL\nQuestion: 주요 차이점은 무엇인가요?"
사용자 지시사항: "확장성과 데이터 구조에 초점을 맞춰서."
결과:
SQL과 NoSQL 데이터베이스의 주요 차이점은 데이터 구조와 확장 방식에 있습니다.
1.  **데이터 구조:** SQL은 정해진 스키마(테이블 구조)를 따르지만, NoSQL은 유연한 데이터 모델을 가집니다.
2.  **확장성:** SQL은 주로 수직적 확장(서버 성능 향상)을, NoSQL은 수평적 확장(서버 수 증가)에 용이하여 대용량 처리에 강점을 보입니다.

**[당신의 차례]**
**질문:**
${topic}
${context ? `**사용자 지시사항:**\n${context}\n` : ""}
**당신의 답변:**`;

		case "findSimilarQuestions":
			return `**역할:** 당신은 질문들 사이의 의미적 유사성을 파악하는 AI 분석가입니다.
**현재 질문:** "${topic}"
**기존 질문 목록:**
${details?.existingQuestionsContext}

${userInstructions}

**기본 지침:**
1. '현재 질문'과 의미적으로 가장 유사하거나 관련된 질문을 '기존 질문 목록'에서 찾아주세요.
2. 가장 관련성이 높은 3~5개의 질문을 그대로 나열하세요.
3. 다른 설명 없이, 한 줄에 하나의 질문만 출력하세요.

**[예시]**
현재 질문: "How do I manage state in React?"
기존 질문 목록:
1. What is Redux and when should I use it?
2. Is 'useState' hook enough for large applications?
3. Differences between CSS-in-JS and CSS Modules.
4. How to optimize performance in a React app?
결과:
What is Redux and when should I use it?
Is 'useState' hook enough for large applications?

**[당신의 차례]**
**현재 질문:** "${topic}"
**기존 질문 목록:**
${details?.existingQuestionsContext}
**당신의 답변:**`;

		default:
			return topic;
	}
}

// --- REFACTORED: 새로운 프롬프트 생성 함수를 사용하도록 수정 ---
export async function generateQuestions(
	topic: string,
	context: string | undefined,
	count: number
): Promise<{ text: string; tokensUsed: number; cost: number }> {
	const prompt = createPrompt("generateQuestions", topic, context, { count });
	return await generateGeminiResponse(prompt);
}

// --- REFACTORED: 새로운 프롬프트 생성 함수를 사용하도록 수정 ---
export async function generateAnswer(
	questionContent: string,
	questionTitle: string,
	additionalContext: string | undefined
): Promise<{ text: string; tokensUsed: number; cost: number }> {
	const fullQuestion = `${
		questionTitle ? `Title: ${questionTitle}\n` : ""
	}Question: ${questionContent}`;
	const prompt = createPrompt(
		"generateAnswer",
		fullQuestion,
		additionalContext
	);
	return await generateGeminiResponse(prompt);
}

// --- REFACTORED: 새로운 프롬프트 생성 함수를 사용하도록 수정 ---
// findSimilarQuestions (기존과 동일한 로직, 프롬프트 생성만 변경)
export async function findSimilarQuestions(
	queryText: string,
	questions: Question[],
	limit: number = 5
): Promise<{
	questions: Question[];
	tokensUsed: number;
	cost: number;
}> {
	if (!genAI) {
		throw new Error("Gemini API client not initialized");
	}

	const questionsContext = questions
		.slice(0, 20) // Limit context size
		.map((q, i) => `${i + 1}. ${q.title || q.content.substring(0, 100)}`)
		.join("\n");

	// 프롬프트 생성 부분만 변경
	const promptString = createPrompt(
		"findSimilarQuestions",
		queryText,
		undefined,
		{ existingQuestionsContext: questionsContext }
	);

	// API 호출 로직은 기존과 완전히 동일
	const response = await genAI.models.generateContent({
		model: MODEL_NAME,
		contents: [{ role: "user", parts: [{ text: promptString }] }],
		config: {
			temperature: 0.3,
			maxOutputTokens: 500,
		},
	});

	const text = response.text;
	if (!text) {
		throw new Error("No response text received from Gemini API");
	}

	const lines = text.trim().split("\n").filter(Boolean);
	const similarQuestions: Question[] = [];

	for (const line of lines.slice(0, limit)) {
		const matchedQuestion = questions.find(
			(q) =>
				(q.title && line.includes(q.title)) ||
				line.includes(q.content.substring(0, 50))
		);
		if (matchedQuestion) {
			similarQuestions.push(matchedQuestion);
		}
	}

	// 토큰 계산 로직도 기존과 완전히 동일
	const tokensUsed = Math.ceil(text.length / CHARS_PER_TOKEN);
	const cost = tokensUsed * COST_PER_TOKEN;

	return { questions: similarQuestions, tokensUsed, cost };
}
