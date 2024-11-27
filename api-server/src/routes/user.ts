import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {getUserDetails} from "../contollers/userController";

export const userRouter = express.Router();

userRouter.get("/details", authMiddleware, getUserDetails);