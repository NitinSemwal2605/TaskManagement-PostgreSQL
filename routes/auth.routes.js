import express from "express";
import jwt from "jsonwebtoken";
import User from "../src/models/Users.js";
import validater from "../middlewares/validate.middleware.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
const router = express.Router();
import crypto from "crypto";

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', validater(registerSchema), async(req,res) =>{
    const {username,email,password} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User Already Exists"});
        }
        const user = new User({
            username,
            email,
            password
        });
        await user.save();
        res.status(201).json({
            message: "User Registered Successfully",
            userId : user._id
        });
    }
    catch(error){
        console.log("Fix the Error : ", error);
        res.status(400).json({message: "Server Error, Please Check Console"});
    }
});


router.post('/login', validater(loginSchema), async (req,res) =>{
    const {email,password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message : "User Not Found"});
        }

        const isValid = await user.comparePassword(password);
        if(!isValid){
            return res.status(400).json({message : "Incorrect Credentials"});
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshToken = hashToken(refreshToken);
        await user.save();

        res.json({
            message : "Login Successful",
            accessToken,
            refreshToken
        });
    }
    catch(error){
        console.log("Fix the Error : ", error);
        res.status(400).json({message: "Server Error Occured"});
    }
});

router.post('/refresh',async (req,res)=>{
    const { refreshToken } = req.body;
    if(!refreshToken){
        return res.status(401).json({message:"Refresh Token Required"});
    }

    try{
        const user = await User.findOne({refreshToken: hashToken(refreshToken)});
        if(!user){
            return res.status(403).json({message:"Invalid Refresh Token"});
        }
        // On Expire Update the Token from DB
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = hashToken(newRefreshToken);
        await user.save();
        
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }catch(err){
        res.status(403).json({message:"Refresh Token Expired"});
    }
});


router.post('/logout', async (req,res)=>{
    const { refreshToken } = req.body;
    if(!refreshToken){
        return res.status(401).json({message:"Refresh Token Required"});
    }
    try{
        // console.log("Haaaaaaa");
        const user = await User.findOne({refreshToken: refreshToken});
        console.log("User Found for Logout : ", user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(user);
        console.log("RefreshToken : ", user.refreshToken);

        user.refreshToken = null;
        await user.save();
        res.json({message:"Logout Successful"});
    }
    catch(err){
        res.status(403).json({message:"Server Error Occured While Logout"});
    }
});


export default router;