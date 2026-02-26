import jwt from "jsonwebtoken";
import process from "process";
import redisClient from "../config/redis.js";
import Session from "../models/session.js";

export default async (req,res,next) => {
  const authHeader = req.headers.authorization;

  if(!authHeader.startsWith("Bearer ")){
    return res.status(401).json({message : "Wrong Authorization Header Format"});
  }

  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({message : "Token is Missing"});
  }

  try{
    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    // console.log("DECODED:", decoded);
  
    
    const cached = await redisClient.get(`session:${decoded.sessionId}`);
    if (cached) {
      console.log("Session Hit in Cache");
      const sessionData = JSON.parse(cached);

      if (new Date(sessionData.expiresAt) < new Date()) {
        return res.status(403).json({ message: "Session Expired" });
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        sessionId: decoded.sessionId
      };

      return next();
    }

    if (!cached) {
      console.log("Cache Missed Session ");
    }

    const session = await Session.findOne({
        where: {
            id: decoded.sessionId,
            userId: decoded.userId,
            status: "Online"
        }
    })

    if(!session){
        return res.status(403).json({ message: "Session Not Found or Invalid" });
    }

    if(session.expiresAt < new Date()){
        session.status = "Offline";
        await session.save();
        return res.status(403).json({ message: "Session Expired" });
    }
    
    // req.user = decoded; // {id , email, sessionId}
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId
    };
    next();
  }
  catch(err){
    console.log("Error : ", err);
    res.status(401).json({message : "Invalid or Token Expired"})
  }
}