import express from "express";
import cors from "cors";
import {rootRouter} from "./routes";
import dotenv from "dotenv";
import { connectToDatabase } from "./db";
import {subClient, subscribeWebSocketMessages} from "./redis"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter)

async function startServer(){
    try{
        await subClient.connect();
        subscribeWebSocketMessages();
        console.log("Connected to Redis Server");
        await connectToDatabase();
        console.log("Connected to Database");
        app.listen(8080, () => {
            console.log("Server running on port 8080");
        });
    }
    catch(err){
        console.log(err);
    }
}

startServer();



