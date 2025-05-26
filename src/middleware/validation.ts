import { NextRequest, NextResponse } from "next/server";
import z, { ZodSchema, ZodError } from "zod";

// NextRequest를 사용하여 validatedData 프로퍼티 추가
interface ValidatedNextRequest<T = unknown> extends NextRequest {
	validatedData?: T;
}

// Route params 타입 정의
type RouteParams = {
	params: { [key: string]: string | string[] };
};
export function validateRequest<T extends ZodSchema>(schema: T) {
	return function <P extends RouteParams | undefined = undefined>(
		handler: (
			req: ValidatedNextRequest<z.infer<T>>,
			params?: P
		) => Promise<NextResponse>
	) {
		return async function (
			req: NextRequest,
			params?: P
		): Promise<NextResponse> {
			try {
				const body = await req.json().catch(() => ({}));
				const validatedData = await schema.parseAsync(body);

				// Create a new request object with validated data
				const validatedReq = Object.assign(req, {
					validatedData,
				}) as ValidatedNextRequest<z.infer<T>>;

				return handler(validatedReq, params);
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
		};
	};
}

// 사용 예시
/**
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const POST = validateRequest(createUserSchema)(
  async (req, params) => {
    // req.validatedData는 자동으로 타입이 지정됨
    const { name, email } = req.validatedData!;
    
    return NextResponse.json({ success: true });
  }
);
*/
