import express from "express";
import {Chat, RoomChat, User} from "../models/dbModels";
import {v4 as uuidGenerate} from 'uuid';

export const getChatAndRoomChats = async (req: express.Request, res: express.Response)=>{
    const conversationId = req.query.conversationId as string;
    try{
        const chat = await Chat.find({ chatId: conversationId }).populate("messages");
        if(chat.length>0){
            res.status(200).json(chat);
            return;
        }
        const roomChats = await RoomChat.find({roomId: conversationId}).populate({
            path: "users",
            select: "email",
        }).populate("messages");

        if(roomChats.length>0){
            res.status(200).json(roomChats);
            return;
        }
        res.status(200).json({messages: "No chats found"});
    }
    catch(err){
        res.status(500).json({error: "Something went wrong"});
    }
}

export const createRoomChat = async (req: express.Request, res: express.Response)=>{
    const {email, roomName} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user || !user.isVerified){
            res.status(400).json({error: "Invalid request"});
            return;
        }
        const roomId = uuidGenerate();
        await RoomChat.create({
            roomId,
            roomName,
            users:[user._id],
            messages: []
        });
        res.status(200).json({messages: "Room successfully created"});
    }
    catch (err) {
        res.status(500).json({error: "Something went wrong"});
    }
}