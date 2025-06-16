// withMiddleware.ts
import { NextRequest, NextResponse } from "next/server";
import z, { ZodSchema, ZodError } from "zod";

// Custom error classes
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

// Error messages
export const ERROR_MESSAGES = {
	INVALID_ADMIN_PASSWORD: "Invalid admin password",
	INVALID_AUTHOR_PASSWORD: "Invalid author password",
	QUESTION_NOT_FOUND: "Question not found",
	GROUP_NOT_FOUND: "Group not found",
	ANSWER_NOT_FOUND: "Answer not found",
	INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

// Extended NextRequest with validated data
interface ValidatedNextRequest<T = unknown> extends NextRequest {
	validatedData?: T;
}

// Route context type for Next.js 14+
type RouteContext<P = Record<string, string>> = {
	params: Promise<P>;
};

// Middleware options
interface MiddlewareOptions<T extends ZodSchema = z.ZodAny> {
	schema?: T;
}

// Main middleware function
export function withMiddleware<
	TSchema extends ZodSchema = z.ZodAny,
	TParams = Record<string, string>
>(options?: MiddlewareOptions<TSchema>) {
	return function (
		handler: (
			req: ValidatedNextRequest<z.infer<TSchema>>,
			context: RouteContext<TParams>
		) => Promise<NextResponse>
	) {
		return async function (
			req: NextRequest,
			context: RouteContext<TParams>
		): Promise<NextResponse> {
			try {
				// Validation
				if (options?.schema) {
					try {
						const body = await req.json().catch(() => ({}));
						const validatedData = await options.schema.parseAsync(body);

						// Create validated request
						const validatedReq = Object.assign(req, {
							validatedData,
						}) as ValidatedNextRequest<z.infer<TSchema>>;

						return await handler(validatedReq, context);
					} catch (error) {
						if (error instanceof ZodError) {
							return NextResponse.json(
								{
									error: "Validation failed",
									details: error.errors,
								},
								{ status: 400 }
							);
						}
						return NextResponse.json(
							{ error: "Invalid request body" },
							{ status: 400 }
						);
					}
				}

				// No validation, just call handler
				return await handler(
					req as ValidatedNextRequest<z.infer<TSchema>>,
					context
				);
			} catch (error: unknown) {
				// Error handling
				console.error("API Error:", error);

				if (error instanceof ApiError) {
					return NextResponse.json(
						{ error: error.message },
						{ status: error.statusCode }
					);
				}

				if (error instanceof Error) {
					// Handle specific error messages
					switch (error.message) {
						case ERROR_MESSAGES.INVALID_ADMIN_PASSWORD:
						case ERROR_MESSAGES.INVALID_AUTHOR_PASSWORD:
							return NextResponse.json(
								{ error: "Unauthorized" },
								{ status: 401 }
							);

						case ERROR_MESSAGES.QUESTION_NOT_FOUND:
						case ERROR_MESSAGES.GROUP_NOT_FOUND:
						case ERROR_MESSAGES.ANSWER_NOT_FOUND:
							return NextResponse.json(
								{ error: error.message },
								{ status: 404 }
							);

						default: {
							const message =
								process.env.NODE_ENV === "development"
									? error.message
									: ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

							return NextResponse.json({ error: message }, { status: 500 });
						}
					}
				}

				return NextResponse.json(
					{ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
					{ status: 500 }
				);
			}
		};
	};
}

// Helper function for routes without validation
export function withErrorHandler<TParams = Record<string, string>>() {
	return withMiddleware<z.ZodAny, TParams>();
}

// Helper function for routes with validation
export function withValidation<
	TSchema extends ZodSchema,
	TParams = Record<string, string>
>(schema: TSchema) {
	return withMiddleware<TSchema, TParams>({ schema });
}
