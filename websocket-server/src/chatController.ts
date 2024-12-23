import WebSocket, {WebSocketServer} from "ws";
import {subClient} from "./redis";

const userSocketMap: Map<string, WebSocket> = new Map();
const channel = "chat-app";

interface Message {
    conversationId: string,
    conversationType: string,
    userIds: string[],
    senderId: string,
    content: string,
    contentType: string
}

const subscribeToMessages = async () => {
    await subClient.subscribe(channel, (data) => {
        try {
            const message = JSON.parse(data) as Message;
            const {senderId, userIds} = message;

            for (const receiverId of userIds) {
                if (receiverId == senderId) continue;
                const socket = userSocketMap.get(receiverId);
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(message));
                }
            }

        } catch (err) {
            console.log(err);
        }
    });
}


export const startWebsocketServer = async (webSocketServer: WebSocketServer) => {

    await subscribeToMessages();

    webSocketServer.on("connection", (socket, request) => {
        const urlParams = new URLSearchParams(request.url?.split("?")[1]);
        const userId = urlParams.get("userId");
        if (!userId) {
            socket.close(1008, "userId header missing");
            return;
        }

        userSocketMap.set(userId, socket);

        socket.on("close", () => {
            userSocketMap.delete(userId);
        });
    });
}