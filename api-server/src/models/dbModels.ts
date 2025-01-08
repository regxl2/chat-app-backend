import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    roomIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RoomChat"
        }
    ],
    chatIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }
    ]
});

const otpSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    },
    userEmail: {
        type: String,
        ref: "User",
        unique: true,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const oneToOneChatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        unique: true
    },
    users: [
        {
            type: String,
            ref: "User"
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    roomName: {
        type: String,
        required: true
    },
    users: [
        {
            type: String,
            ref: "User"
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const User = mongoose.model("User", userSchema);
export const Otp = mongoose.model("Otp", otpSchema);
export const Message = mongoose.model("Message", messageSchema);
export const Chat = mongoose.model("Chat", oneToOneChatSchema);
export const RoomChat = mongoose.model("RoomChat", chatRoomSchema);


