import express from "express";
import {createRoomChat, getChatAndRoomChats} from "../contollers/chatController";
import {authMiddleware} from "../middlewares/authMiddleware";

export const chatRouter = express.Router();

chatRouter.get("/get-chats", authMiddleware, getChatAndRoomChats);
chatRouter.post("/create-room", authMiddleware, createRoomChat);
