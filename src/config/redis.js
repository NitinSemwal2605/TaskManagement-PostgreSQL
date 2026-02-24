import process from "process";
import redis from "redis";

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("connect", () => {
    console.log("Redis Connection Established");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

export async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Redis Client Connected Successfully");
    } catch (err) {
        console.error("Redis Connection Failed:", err);
        throw err;
    }
}

export default redisClient;