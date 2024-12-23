import express from "express";
import {addUserToRoomChat, createRoomChat, getChatAndRoomChats, sendMessage} from "../contollers/chatController";
import {authMiddleware} from "../middlewares/authMiddleware";

export const chatRouter = express.Router();

chatRouter.get("/get-chats", authMiddleware, getChatAndRoomChats);
chatRouter.post("/create-room", authMiddleware, createRoomChat);
chatRouter.post("/send-message", authMiddleware, sendMessage);
chatRouter.post("/add-room-user", authMiddleware, addUserToRoomChat);
