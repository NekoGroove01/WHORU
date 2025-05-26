import { NextRequest, NextResponse } from "next/server";
import { createServer } from "http";
import { initializeSocketServer } from "@/lib/socket/server";

// Socket.IO initialization endpoint
export async function GET(req: NextRequest) {
	// This endpoint is used to initialize Socket.IO if needed
	// In production, you might want to handle this differently

	return NextResponse.json({
		status: "Socket.IO server is ready",
		url:
			process.env.NODE_ENV === "production"
				? process.env.NEXT_PUBLIC_APP_URL
				: "http://localhost:3000",
	});
}
