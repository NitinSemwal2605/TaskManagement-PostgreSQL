import redisClient from "../config/redis.js";

export const cache = (ttl = 3600) => async(req,res,next) =>{
    if(req.method !== "GET") return next();

    // const key = req.originalUrl ;
    const key = `${req.originalUrl}_user_${req.user.id}`;
    try{
        const cached = await redisClient.get(key);
        if(cached){
            console.log("Cache Hit", key);
            return res.json(JSON.parse(cached));
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