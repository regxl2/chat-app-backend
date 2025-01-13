import express from "express";
import {Chat, Message, RoomChat, User} from "../models/dbModels";
import {v4 as uuidGenerate} from 'uuid';
import {messageSchema} from "../models/messageSchema";
import {pubClient} from "../redis";

interface MessageBody {
    conversationId: string,
    conversationType: string,
    email: string,
    content: string,
    contentType: string
}

interface Message {
    _id: string,
    senderId: string,
    senderName: string,
    content: string,
    contentType: string,
    createdAt: Date
}

interface Chat {
    chatId: string,
    users: string[],
    messages: Message[],
    createdAt: Date
}

interface Room {
    roomId: string,
    roomName: string,
    messages: Message[],
    createdAt: Date
}


const channel = "chat-app";

export const getConversations = async (req: express.Request, res: express.Response) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        const chats = await Promise.all(
            user.chatIds.map((chatId) => {
                return Chat.findOne({_id: chatId}).populate({
                    path: 'messages',
                    options: {
                        sort: { createdAt: -1 },
                        limit: 1
                    }
                })
            })
        );

        const chatConversations = await Promise.all(
            chats.filter( c => c!=null).map(async (c) => {
                const chat = c as unknown as Chat;
                const otherUserEmail = chat.users[0] == email ? chat.users[1] : chat.users[0];
                const otherUser = await User.findOne({email: otherUserEmail});
                return {
                    conversationType: "chat",
                    conversationId: chat.chatId,
                    name: otherUser?.name,
                    createdAt: chat.createdAt,
                    lastMessage: chat.messages[0] ? {
                        id: chat.messages[0]._id,
                        senderId: chat.messages[0].senderId,
                        senderName: chat.messages[0].senderId == email ? "You" : chat.messages[0].senderName,
                        content: chat.messages[0].content,
                        contentType: chat.messages[0].contentType,
                        createdAt: chat.messages[0].createdAt,
                        isMine: email == chat.messages[0].senderId
                    } : null
                }
            })
        );

        const rooms  = await Promise.all(
            user.roomIds.map(async (roomId) => {
                return RoomChat.findOne({_id: roomId}).populate({
                    path: "messages",
                    options: {
                        sort: { createdAt: -1 },
                        limit: 1
                    }
                })
            })
        );

        const roomConversations = await Promise.all(
            rooms.filter((r) => r != null).map(async (r) => {
                const room = r as unknown as Room;
                return {
                    conversationType: "room",
                    conversationId: room.roomId,
                    name: room.roomName,
                    createdAt: room.createdAt,
                    lastMessage: room.messages[0] ? {
                        id: room.messages[0]._id,
                        senderId: room.messages[0].senderId,
                        senderName: room.messages[0].senderId == email ? "You" : room.messages[0].senderName,
                        content: room.messages[0].content,
                        contentType: room.messages[0].contentType,
                        createdAt: room.messages[0].createdAt,
                        isMine: email == room.messages[0].senderId
                    }: null
                }
            })
        );

        const conversations = [
            ...chatConversations,
            ...roomConversations
        ].sort((a, b) => {
            if (a.lastMessage && b.lastMessage) {
                return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
            } else if (a.lastMessage && !b.lastMessage) {
                return b.createdAt.getTime() - a.lastMessage.createdAt.getTime();
            } else if (!a.lastMessage && b.lastMessage) {
                return b.lastMessage.createdAt.getTime() - a.createdAt.getTime();
            }
            return b.createdAt.getTime() - a.createdAt.getTime();
        });
        res.status(200).json({conversations});
    } catch (err) {
        console.log(err);
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
        const user = await User.findOne({email: message.email});
        const dbMessage = await Message.create({
            senderId: message.email,
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
                const chatRoomUsers = await Promise.all(chatUsers.map(email => User.findOne({email})));
                const uniqueChatRoomUsers = chatRoomUsers.filter(user => user!=null).filter((user, index, self) =>
                    index === self.findIndex(u => u && u._id.toString() === user._id.toString())
                );
                await Promise.all(
                    uniqueChatRoomUsers.filter(user => user != null)
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
        const extendedMessageBody = {
            _id: dbMessage._id,
            senderId: dbMessage.senderId,
            senderName: dbMessage.senderName,
            content: dbMessage.content,
            contentType: dbMessage.contentType,
            createdAt: dbMessage.createdAt,
            conversationId: message.conversationId,
            userIds
        };
        await pubClient.publish(channel, JSON.stringify(extendedMessageBody))
        res.status(200).json({message: "Message sent successfully."});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const getChatAndRoomMessages = async (req: express.Request, res: express.Response) => {
    const {email} = req.body;
    const conversationId = req.query.conversationId as string;
    const conversationType = req.query.conversationType as string;
    try {
        if (conversationType == "chat") {
            const chats = await Chat.findOne({
                chatId: conversationId,
                users: {$elemMatch: {$eq: email}}
            }).populate("messages");
            if(!chats){
                res.status(200).json({messages: []});
                return;
            }
            const messages = chats?.messages as unknown as Message[];
            const transformedMessages = messages.map((message) => {
                return {
                    id: message._id,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    content: message.content,
                    contentType: message.contentType,
                    isMine: message.senderId == email,
                    createdAt: message.createdAt
                }
            })
            res.status(200).json({messages: transformedMessages})
            return;
        } else if (conversationType == "room") {
            const roomChats = await RoomChat.findOne({
                roomId: conversationId,
                users: {$elemMatch: {$eq: email}}
            }).populate("messages");
            const messages = roomChats?.messages as unknown as Message[];
            const transformedMessages = messages.map((message) => {
                return {
                    id: message._id,
                    senderId: message.senderId,
                    senderName: message.senderName,
                    content: message.content,
                    contentType: message.contentType,
                    isMine: message.senderId == email,
                    createdAt: message.createdAt
                }
            })
            res.status(200).json({messages: transformedMessages});
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
        res.status(200).json({message: "Room successfully created"});
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
        const user = await User.findOne({email: userId});
        if(!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        roomChat.users.push(userId);
        await roomChat.save();
        user.roomIds.push(roomChat._id);
        await user.save();
        res.status(200).json({message: "User added Successfully."});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}