import {createClient} from 'redis';

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

export const pubClient = createClient({url: redisUrl}); // in case of docker
// export const subClient = createClient(); if running on locally installed redis
pubClient.on('error', (err) => console.log(err));

