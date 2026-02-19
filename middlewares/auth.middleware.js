import jwt from "jsonwebtoken";

export default (req,res,next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).json({message : "Authorization Header Missing"});
  }

  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({message : "Token is Missing"});
  }

  try{
    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // {id , email}
    next();
  } catch(err){
    console.log("Error : ", err);
    res.status(401).json({message : "Invalid or Token Expired"})
  }
}