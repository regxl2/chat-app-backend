import express from "express";
import {emailNamePassSchema} from "../models/emailNamePassSchema";
import {User} from "../models/dbModels"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import {otpValidation, sendOtpForPassReset, sendOtpForSignUp} from "./otpController";
import {emailOtpSchema} from "../models/emailOtpSchema";
import {emailPassSchema} from "../models/emailPassSchema";
import {emailSchema} from "../models/emailSchema";
import dotenv from "dotenv";

dotenv.config();

export const authenticate = async (req: express.Request, res: express.Response) => {
    const {email} = req.body;
    res.status(200).json({message: email});
}

export const signUp = async (req: express.Request, res: express.Response)=> {
    const {success, error} = emailNamePassSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({error: error.errors[0].message})
        return;
    }
    try{
        const {name, email, password} = req.body;
        const user = await User.findOne({email});
        if(user && user.isVerified){
            res.status(411).json({error: "Account with this email already exists"});
            return;
        }
        if(!user){
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({name, email, password: hashedPassword});
        }
        const result = await sendOtpForSignUp(email);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const signUpOtpVerification = async (req: express.Request, res: express.Response) => {
    const {success, error} = emailOtpSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email, code} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(411).json({error: "User with this email does not exists"});
            return;
        }
        if(user && user.isVerified){
            res.status(411).json({error: "Account with this email already exists"});
            return;
        }
        const isOtpValid = await otpValidation(code, email);
        if(!isOtpValid){
            res.status(411).json({error: "Invalid OTP"});
            return;
        }
        await User.updateOne({email}, {isVerified: true});
        res.status(200).json({message: "Your account has been verified"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const resendOtpForSignUp = async(req: express.Request, res: express.Response)=>{
    const {success, error} = emailSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user || user && user.isVerified){
            res.status(411).json({error: "Invalid Request"});
            return;
        }
        const result = await sendOtpForSignUp(email);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const login = async (req: express.Request, res: express.Response) => {
    const {success, error} = emailPassSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(411).json({error: "User with this email does not exists"});
            return;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(isPasswordValid){
            const token = jwt.sign({email}, process.env.JWT_SECRET||"", {expiresIn: '30d'});
            res.status(200).json({token});
        }
        else{
            res.status(411).json({error: "Invalid password"});
        }
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const passwordResetRequest = async(req: express.Request, res: express.Response) => {
    const {success, error} = emailSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const { email } = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(411).json({error: "User with this email does not exists"});
            return;
        }
        const result = await sendOtpForPassReset(email);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const passResetOtpVerification = async (req: express.Request, res: express.Response) => {
    const {success, error} = emailOtpSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email, code} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(411).json({error: "User with this email does not exists"});
            return;
        }
        const isOtpValid = await otpValidation(code, email);
        if(!isOtpValid){
            res.status(411).json({error: "Invalid OTP"});
            return;
        }
        res.status(200).json({message: "Your OTP has been verified"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const resendOtpForPassReset = async(req: express.Request, res: express.Response)=>{
    const {success, error} = emailSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user || user && !user.isVerified){
            res.status(411).json({error: "Invalid Request"});
            return;
        }
        const result = await sendOtpForPassReset(email);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Something went wrong"});
    }
}

export const changePassword = async(req: express.Request, res: express.Response) => {
    const {success, error} = emailPassSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({error: error.errors[0].message});
        return;
    }
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(411).json({error: "User with this email does not exists"});
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({email}, {password: hashedPassword});
        res.status(200).json({message: "Password updated successfully"});
    }
    catch(err){
        res.status(500).json({error: "Something went wrong"});
    }
}




