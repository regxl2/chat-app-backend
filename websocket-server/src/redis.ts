import {createClient} from "redis";

export const pubClient = createClient();
pubClient.on("error", err => console.log("Redis Pub Client Error:", err));

export const subClient = createClient();
subClient.on("error", err => console.log("Redis Sub Client Error:", err));
