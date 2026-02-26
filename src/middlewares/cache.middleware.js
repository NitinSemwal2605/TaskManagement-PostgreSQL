import redisClient from "../config/redis.js";

export const cache = (ttl = 3600) => async(req,res,next) =>{
    if(req.method !== "GET") return next();

    // const key = req.originalUrl ;
    const key = `${req.originalUrl}_user_${req.user.userId}`; // Here req.user.id is fetched from auth middleware and it is unique for each user, so it will create a unique cache for each user.
    try{
        const cached = await redisClient.get(key);
        if (cached) {
            const sessionData = JSON.parse(cached);

            if (new Date(sessionData.expiresAt) < new Date()) {
                return res.status(403).json({ message: "Session Expired" });
            }

            return next();
        }

        console.log("Cache Missed :", key);

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