import express from 'express';
import {authRouter} from "./auth";
import {userRouter} from "./user";
import { chatRouter } from './chat';

export const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/user", userRouter);
rootRouter.use("/chat", chatRouter);