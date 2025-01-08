import express from "express";
import {
    addUserToRoomChat,
    createRoomChat,
    getChatAndRoomMessages,
    getConversations,
    sendMessage
} from "../contollers/chatController";
import {authMiddleware} from "../middlewares/authMiddleware";

export const chatRouter = express.Router();

chatRouter.get("/get-conversations", authMiddleware, getConversations);
chatRouter.get("/get-chat", authMiddleware, getChatAndRoomMessages);
chatRouter.post("/create-room", authMiddleware, createRoomChat);
chatRouter.post("/send-message", authMiddleware, sendMessage);
chatRouter.post("/add-room-user", authMiddleware, addUserToRoomChat);
