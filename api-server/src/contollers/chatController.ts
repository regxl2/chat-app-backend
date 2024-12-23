import express from "express";
import {Chat, Message, RoomChat, User} from "../models/dbModels";
import {v4 as uuidGenerate} from 'uuid';
import {messageSchema} from "../models/messageSchema";
import {pubClient} from "../redis";

interface MessageBody {
    conversationId: string,
    conversationType: string,
    senderId: string,
    content: string,
    contentType: string
}

const channel = "chat-app";

export const sendMessage = async (req: express.Request, res: express.Response) => {
    const message = req.body as MessageBody;
    const {success, error} = messageSchema.safeParse(message);
    if (!success) {
        res.status(411).json({error: error.errors[0].message})
        return;
    }
    try {
        const dbMessage = await Message.create({
            senderId: message.senderId,
            content: message.content,
            contentType: message.contentType
        });
        let userIds: string[] = [];
        if (message.conversationType == "chat-message") {
            const chats = await Chat.findOne({chatId: message.conversationId});
            if (!chats) {
                const chatUsers = message.conversationId.split("-");
                userIds.push(...chatUsers);
                const chatRoom = await Chat.create({
                    chatId: message.conversationId,
                    users: chatUsers,
                    messages: [dbMessage._id]
                });
                const chatRoomUsers = await Promise.all(chatUsers.map(email => User.findOne({email})))
                await Promise.all(
                    chatRoomUsers.filter(user => user != null)
                        .map(user => {
                            user.chatIds.push(chatRoom._id)
                            return user.save();
                        })
                );
            } else {
                userIds.push(...chats.users);
                chats.messages.push(dbMessage._id);
                await chats.save();
            }
        } else if (message.conversationType == "room-message") {
            const roomChats = await RoomChat.findOne({roomId: message.conversationId});
            if (roomChats) {
                userIds.push(...roomChats.users);
                roomChats.messages.push(dbMessage._id);
                await roomChats.save();
            }
        }
        const extendedMessageBody = {...message, userIds};
        await pubClient.publish(channel, JSON.stringify(extendedMessageBody))
        res.status(200).json({message: "Message sent successfully."});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const getChatAndRoomChats = async (req: express.Request, res: express.Response) => {
    const conversationId = req.query.conversationId as string;
    const email = req.body.email as string;
    console.log("Conversation ID: ", conversationId);
    console.log("email: ", email);
    try {
        const chats = await Chat.findOne({
            chatId: conversationId,
            users: {$elemMatch: {$eq: email}}
        }).populate("messages");
        if (chats) {
            res.status(200).json(chats.messages);
            return;
        }
        const roomChats = await RoomChat.findOne({
            roomId: conversationId,
            users: {$elemMatch: {$eq: email}}
        }).populate("messages");

        if (roomChats) {
            res.status(200).json(roomChats.messages);
            return;
        }
        res.status(404).json({error: "No chats found"});
    } catch (err) {
        res.status(500).json({error: "Something went wrong"});
    }
}

export const createRoomChat = async (req: express.Request, res: express.Response) => {
    const {email, roomName} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user || !user.isVerified) {
            res.status(400).json({error: "Invalid request"});
            return;
        }
        const roomId = uuidGenerate();
        const room = await RoomChat.create({
            roomId,
            roomName,
            users: [user.email],
            messages: []
        });
        user.roomIds.push(room._id);
        await user.save();
        res.status(200).json({messages: "Room successfully created"});
    } catch (err) {
        res.status(500).json({error: "Something went wrong"});
    }
}

export const addUserToRoomChat = async (req: express.Request, res: express.Response) => {
    const {roomId, user, email} = req.body;
    try {
        const roomChat = await RoomChat.findOne({roomId, users: {$elemMatch: {$eq: email}}});
        if (!roomChat) {
            res.status(400).json({error: "Invalid request"});
            return;
        }
        roomChat.users.push(user);
        await roomChat.save();
        res.status(200).json({messages: "User added Successfully."});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}