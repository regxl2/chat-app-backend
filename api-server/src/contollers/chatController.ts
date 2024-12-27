import express from "express";
import {Chat, Message, RoomChat, User} from "../models/dbModels";
import {v4 as uuidGenerate} from 'uuid';
import {messageSchema} from "../models/messageSchema";
import {pubClient} from "../redis";

interface MessageBody {
    conversationId: string,
    conversationType: string,
    senderId: string,
    senderName: string,
    content: string,
    contentType: string
}

interface Message {
    senderId: string,
    senderName: string,
    content: string,
    contentType: string,
    createdAt: Date
}

interface Chat{
    chatId: string,
    users: string[],
    messages: Message[]
}

interface Room {
    roomId: string,
    roomName: string,
    messages: Message[]
}


const channel = "chat-app";


export const getConversations = async (req: express.Request, res: express.Response) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email}).populate({
            path: "chatIds",
            select: ["chatId", "users", "messages"],
            populate: {
                path: "messages",
                options: {limit: 1, sort: {createdAt: -1}}
            }
        }).populate({
            path: "roomIds",
            select: ["roomId", "roomName", "messages"],
            populate: {
                path: "messages",
                options: {limit: 1, sort: {createdAt: -1}}
            }
        });

        if (!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        const chatConversations = await Promise.all(
            user.chatIds.map(async c => {
                const chat = c as unknown as Chat;
                const otherUserEmail = chat.users[0] == email ? chat.users[1] : chat.users[0];
                const otherUser = await User.findOne({email: otherUserEmail});
                return {
                    conversationType: "chat",
                    conversationId: chat.chatId,
                    name: otherUser?.name,
                    lastMessage: chat.messages[0]
                }
            })
        );
        const roomConversations = user.roomIds.map(r => {
            const room = r as unknown as Room;
            return {
                conversationType: "room",
                conversationId: room.roomId,
                name: room.roomName,
                lastMessage: room.messages[0]
            }
        });

        const conversations = [
            ...chatConversations,
            ...roomConversations
        ].sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());

        res.status(200).json({conversations});
    } catch (err) {
        res.status(500).send({error: "Something is wrong"});
    }
}

export const sendMessage = async (req: express.Request, res: express.Response) => {
    const message = req.body as MessageBody;
    const {success, error} = messageSchema.safeParse(message);
    if (!success) {
        res.status(411).json({error: error.errors[0].message})
        return;
    }
    try {
        const user = await User.findOne({email: message.senderId});
        const dbMessage = await Message.create({
            senderId: message.senderId,
            senderName: user?.name,
            content: message.content,
            contentType: message.contentType
        });
        let userIds: string[] = [];
        if (message.conversationType == "chat") {
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
        } else if (message.conversationType == "room") {
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
    const {conversationId, conversationType, email} = req.body;
    try {
        if (conversationType == "chat") {
            const chats = await Chat.findOne({
                chatId: conversationId,
                users: {$elemMatch: {$eq: email}}
            }).populate("messages");
            res.status(200).json(chats == null ? [] : chats.messages)
            return;
        } else if (conversationType == "room") {
            const roomChats = await RoomChat.findOne({
                roomId: conversationId,
                users: {$elemMatch: {$eq: email}}
            }).populate("messages");
            res.status(200).json(roomChats == null ? [] : roomChats.messages);
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
    const {roomId, userId, email} = req.body;
    try {
        const roomChat = await RoomChat.findOne({roomId, users: {$elemMatch: {$eq: email}}});
        if (!roomChat) {
            res.status(400).json({error: "Invalid request"});
            return;
        }
        roomChat.users.push(userId);
        await roomChat.save();
        const user = await User.findOne({email: userId});
        if (user) {
            user.chatIds.push(roomChat._id);
            await user.save();
        }
        res.status(200).json({messages: "User added Successfully."});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}