import { NextRequest, NextResponse } from "next/server";

// Route params 타입 정의
type RouteParams = {
	params: { [key: string]: string | string[] };
};

// 커스텀 에러 클래스들
export class ApiError extends Error {
	constructor(message: string, public statusCode: number) {
		super(message);
		this.name = "ApiError";
	}
}

export class UnauthorizedError extends ApiError {
	constructor(message: string = "Unauthorized") {
		super(message, 401);
		this.name = "UnauthorizedError";
	}
}

export class NotFoundError extends ApiError {
	constructor(message: string) {
		super(message, 404);
		this.name = "NotFoundError";
	}
}

// 에러 메시지 상수
export const ERROR_MESSAGES = {
	INVALID_ADMIN_PASSWORD: "Invalid admin password",
	INVALID_AUTHOR_PASSWORD: "Invalid author password",
	QUESTION_NOT_FOUND: "Question not found",
	GROUP_NOT_FOUND: "Group not found",
	INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

// 에러 타입 가드
function isError(error: unknown): error is Error {
	return error instanceof Error;
}

// 업그레이드된 withErrorHandler
export function withErrorHandler<P extends RouteParams | undefined = undefined>(
	handler: (req: NextRequest, params?: P) => Promise<NextResponse>
) {
	return async function (req: NextRequest, params?: P): Promise<NextResponse> {
		try {
			return await handler(req, params);
		} catch (error: unknown) {
			console.error("API Error:", error);

			// ApiError 인스턴스 체크
			if (error instanceof ApiError) {
				return NextResponse.json(
					{ error: error.message },
					{ status: error.statusCode }
				);
			}

			// 일반 Error 인스턴스 체크
			if (isError(error)) {
				// 특정 에러 메시지에 따른 처리
				switch (error.message) {
					case ERROR_MESSAGES.INVALID_ADMIN_PASSWORD:
					case ERROR_MESSAGES.INVALID_AUTHOR_PASSWORD:
						return NextResponse.json(
							{ error: "Unauthorized" },
							{ status: 401 }
						);

					case ERROR_MESSAGES.QUESTION_NOT_FOUND:
					case ERROR_MESSAGES.GROUP_NOT_FOUND:
						return NextResponse.json({ error: error.message }, { status: 404 });

					default: {
						// 개발 환경에서는 실제 에러 메시지 반환, 프로덕션에서는 일반 메시지
						const message =
							process.env.NODE_ENV === "development"
								? error.message
								: ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

						return NextResponse.json({ error: message }, { status: 500 });
					}
				}
			}

			// 알 수 없는 에러 타입
			return NextResponse.json(
				{ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
				{ status: 500 }
			);
		}
	};
}

// 사용 예시:
/**
커스텀 에러 클래스 사용
export const GET = withErrorHandler(async (req, params) => {
  const question = await QuestionsCollection.findById(params?.params.id);
  
  if (!question) {
    throw new NotFoundError(ERROR_MESSAGES.QUESTION_NOT_FOUND);
  }
  
  return NextResponse.json(question);
});

또는 기존 방식 유지
export const POST = withErrorHandler(async (req) => {
  const isValid = await checkPassword(password);
  
  if (!isValid) {
    throw new Error(ERROR_MESSAGES.INVALID_ADMIN_PASSWORD);
  }
  
  return NextResponse.json({ success: true });
});
*/
