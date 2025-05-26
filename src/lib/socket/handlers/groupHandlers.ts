import { Socket } from "socket.io";
import { SOCKET_EVENTS, JoinGroupPayload } from "../events";

export function handleGroupEvents(socket: Socket): void {
	// Join group room
	socket.on(SOCKET_EVENTS.JOIN_GROUP, async (data: JoinGroupPayload) => {
		try {
			const { groupId } = data;

			// Leave all current group rooms
			const rooms = Array.from(socket.rooms);
			for (const room of rooms) {
				if (room.startsWith("group:") && room !== socket.id) {
					socket.leave(room);
				}
			}

			// Join new group room
			const roomName = `group:${groupId}`;
			await socket.join(roomName);

			console.log(`Socket ${socket.id} joined ${roomName}`);

			// Notify user of successful join
			socket.emit(SOCKET_EVENTS.GROUP_ACTIVITY, {
				groupId,
				type: "system",
				action: "joined",
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Error joining group:", error);
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: "Failed to join group",
			});
		}
	});

	// Leave group room
	socket.on(SOCKET_EVENTS.LEAVE_GROUP, async (data: JoinGroupPayload) => {
		try {
			const { groupId } = data;
			const roomName = `group:${groupId}`;

			await socket.leave(roomName);
			console.log(`Socket ${socket.id} left ${roomName}`);
		} catch (error) {
			console.error("Error leaving group:", error);
		}
	});
}
