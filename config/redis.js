const session = require('express-session')
const redis = require('redis')

const RedisStore = require('connect-redis')(session)

const redisClient = redis.createClient(6379, "127.0.0.1");
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connection established.'));

// let store = new RedisStore({
//     client: redisClient,
//     ttl: 260
// })


module.exports = {
    RedisStore,
    redisClient,
    session
}