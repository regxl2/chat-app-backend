import express from "express";
import {WebSocketServer} from "ws";
import cors from "cors";
import {startWebsocketServer} from "./chatController";
import {subClient} from "./redis";

const app = express();
const PORT = process.env.WEBSOCKET_PORT || 3001;

app.use(cors());
app.use(express.json());

async function startServer(){
    try{
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

