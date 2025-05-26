import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/lib/socket/events";

let socket: Socket | null = null;

// Initialize socket connection
export function initializeSocket(): Socket {
	if (socket?.connected) return socket;

	const socketUrl =
		process.env.NEXT_PUBLIC_SOCKET_URL ||
		(typeof window !== "undefined" ? window.location.origin : "");

	socket = io(socketUrl, {
		transports: ["websocket", "polling"],
		autoConnect: true,
	});

	socket.on("connect", () => {
		console.log("Socket connected:", socket?.id);
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected");
	});

	socket.on("error", (error) => {
		console.error("Socket error:", error);
	});

	return socket;
}

// Get socket instance
export function getSocket(): Socket | null {
	return socket;
}

// Join group room
export function joinGroup(groupId: string): void {
	if (!socket?.connected) return;
	socket.emit(SOCKET_EVENTS.JOIN_GROUP, { groupId });
}

// Leave group room
export function leaveGroup(groupId: string): void {
	if (!socket?.connected) return;
	socket.emit(SOCKET_EVENTS.LEAVE_GROUP, { groupId });
}

// Disconnect socket
export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
