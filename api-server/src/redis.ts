import {createClient} from 'redis';
import {Chat, Message, RoomChat, User} from './models/dbModels';

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

export const subClient = createClient({url: redisUrl}); // in case of docker
// export const subClient = createClient(); if running on locally installed redis
subClient.on('error', (err) => console.log(err));

const channel = "chat-app";

interface Message {
    conversationId: string,
    conversationType: string,
    userIds: string[],
    senderId: string,
    content: string,
    contentType: string
}

export const subscribeWebSocketMessages = () => {
    subClient.subscribe(channel, async (data) => {
        try {
            const message = JSON.parse(data) as Message;
            const dbMessage = await Message.create({
                senderId: message.senderId,
                content: message.content,
                contentType: message.contentType
            });
            if (message.conversationType == "chat-message") {
                const chats = await Chat.findOne({chatId: message.conversationId});
                if (!chats) {
                    const chat = await Chat.create({chatId: message.conversationId, messages: [dbMessage._id]});
                } else {
                    chats.messages.push(dbMessage._id);
                    await chats.save();
                }
            } else if (message.conversationType == "room-message") {
                const roomChats = await RoomChat.findOne({roomId: message.conversationId});
                if (roomChats) {
                    roomChats.messages.push(dbMessage._id);
                    await roomChats.save();
                }
            }
        } catch (err) {
            console.log(err);
        }
    });
}