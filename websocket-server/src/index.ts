import express from "express";
import {WebSocketServer} from "ws";
import cors from "cors";
import {startWebsocketServer} from "./chatController";
import {pubClient, subClient} from "./redis";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function startServer(){
    try{
        await pubClient.connect();
        await subClient.connect();
        console.log("Connected to the Redis server");
        const httpServer = app.listen(PORT, ()=>{
            console.log(`Websocket server started on port: ${PORT}`);
        });
        const websocketServer = new WebSocketServer({server: httpServer});
        startWebsocketServer(websocketServer);
    }
    catch (err){
        console.log("Failed to connect to Redis server:", err);
    }
}

startServer();

