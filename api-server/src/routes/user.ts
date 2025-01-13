import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {getUserDetails, searchUsers, searchForRoomUsers} from "../contollers/userController";
import {authRouter} from "./auth";

export const userRouter = express.Router();

userRouter.get("/details", authMiddleware, getUserDetails);
userRouter.get("/search", authMiddleware, searchUsers);
userRouter.get("/search-room-users", authMiddleware, searchForRoomUsers);