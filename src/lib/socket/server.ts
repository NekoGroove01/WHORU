import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import {
	handleGroupEvents,
	handleQuestionEvents,
	handleAnswerEvents,
} from "./handlers/index";

let io: SocketIOServer | null = null;

// Initialize Socket.IO server
export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
	if (io) return io;

	io = new SocketIOServer(httpServer, {
		cors: {
			origin:
				process.env.NODE_ENV === "production"
					? process.env.NEXT_PUBLIC_APP_URL
					: "http://localhost:3000",
			methods: ["GET", "POST"],
		},
		transports: ["websocket", "polling"],
	});

	// Connection handler
	io.on("connection", (socket: Socket) => {
		console.log(`Client connected: ${socket.id}`);

		// Register event handlers
		handleGroupEvents(socket);
		handleQuestionEvents(socket, io);
		handleAnswerEvents(socket, io);

		// Handle disconnection
		socket.on("disconnect", () => {
			console.log(`Client disconnected: ${socket.id}`);
		});

		// Error handler
		socket.on("error", (error: unknown) => {
			if (error instanceof Error) {
				console.error(`Socket error for ${socket.id}:`, error.message);
			}
		});
	});

	return io;
}

// Get Socket.IO instance
export function getSocketServer(): SocketIOServer | null {
	return io;
}

// Emit event to specific group
export function emitToGroup(
	groupId: string,
	event: string,
	data: unknown
): void {
	if (!io) return;
	io.to(`group:${groupId}`).emit(event, data);
}

// Emit event to specific user
export function emitToSocket(
	socketId: string,
	event: string,
	data: unknown
): void {
	if (!io) return;
	io.to(socketId).emit(event, data);
}
