import express from "express";
import cors from "cors";
import {rootRouter} from "./routes";
import dotenv from "dotenv";
import { connectToDatabase } from "./db";
import {pubClient} from "./redis"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1", rootRouter)

const PORT = process.env.API_SERVER_PORT || 8080;

async function startServer(){
    try{
        await pubClient.connect();
        console.log("Connected to Redis Server");
        await connectToDatabase();
        console.log("Connected to Database");
        app.listen(PORT, () => {
            console.log("Server running on port 8080");
        });
    }
    catch(err){
        console.log(err);
    }
}

startServer();



