import {createClient} from "redis";

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

export const pubClient = createClient({url: redisUrl});
pubClient.on("error", err => console.log("Redis Pub Client Error:", err));

export const subClient = createClient({url: redisUrl});
subClient.on("error", err => console.log("Redis Sub Client Error:", err));
