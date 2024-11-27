import express from "express";
import {User} from "../models/dbModels";


export const getUserDetails = async(req: express.Request, res: express.Response) => {
    const { email } = req.body;
    try{
        const user  = await User.findOne({email});
        if(user){
            res.status(200).json({id: user._id, email: user.email, name: user.name});
        }
        else{
            res.status(411).json({error: "User with this email does not exists"});
        }
    }
    catch(err){
        res.status(411).json({error: "Something went wrong"});
    }
}