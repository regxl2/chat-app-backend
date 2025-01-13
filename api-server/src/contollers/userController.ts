import express, {query} from "express";
import {RoomChat, User} from "../models/dbModels";

export const getUserDetails = async (req: express.Request, res: express.Response) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email});
        if (user) {
            res.status(200).json({email: user.email, name: user.name});
        } else {
            res.status(411).json({error: "User with this email does not exists"});
        }
    } catch (err) {
        res.status(411).json({error: "Something went wrong"});
    }
}

export const searchUsers = async (req: express.Request, res: express.Response) => {
    const query = req.query.query as string;
    try {
        const users = await User.find({name: {$regex: query, $options: 'i'}, isVerified: true})
            .select({name: 1, email: 1});
        if(users.length == 0){
            res.status(404).json({error: "No User found"});
        }
        else{
            res.status(200).json({users});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const searchForRoomUsers = async (req: express.Request, res: express.Response) => {
    const {conversationId, query} = req.query;
    console.log(req.query);
    try{
        const room = await RoomChat.findOne({roomId: conversationId});
        if(!room){
            res.status(404).json({error: "Room not found"});
            return;
        }
        const queryUser = await User.find({name: {$regex: query, $options: 'i'}, isVerified: true})
            .select({name: 1, email: 1});
        const roomUsers = new Set(room.users);
        const users = queryUser.map(user => {
            return {
                _id: user._id,
                email: user.email,
                name: user.name,
                isRoomMember: roomUsers.has(user.email)
            }
        });
        if(users.length == 0){
            res.status(404).json({error: "No User found"});
        }
        else{
            res.status(200).json({users});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}
