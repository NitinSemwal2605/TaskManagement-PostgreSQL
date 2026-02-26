import redisClient from "../config/redis.js";

export const cache = (role,ttl = 3600) => async(req,res,next) =>{
    if(req.method !== "GET") return next();

    const userId = req.user.id;
    const id = req.params.id;

    const key = id ? `user:${userId}:role:${role}:id:${id}` : `user:${userId}:role:${role}`;
    try{
        const cached = await redisClient.get(key);
        if (cached) {
            console.log("Cache Hit Data");
            const sessionData = JSON.parse(cached);

            if (new Date(sessionData.expiresAt) < new Date()) {
                return res.status(403).json({ message: "Session Expired" });
            }

            return next();
        }

        console.log("Cache Missed Data");

        const orignal = res.json;
        res.json = async (data) =>{
            await redisClient.setEx(key,ttl,JSON.stringify(data));
            return orignal.call(res,data);
        }
        next();

    } catch(error){
        console.log("Error Occured while Caching:", error);
        next();
    }
}


export const invalidateCache = async(key) =>{
    try{
        await redisClient.del(key);
        console.log("Key Invalidated :", key);
    }
    catch(error){
        console.log("Error Occured While Invalidate Cache :", error);
    }
}