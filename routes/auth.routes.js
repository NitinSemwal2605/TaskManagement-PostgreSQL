import bcrypt from "bcrypt";
import crypto from "crypto";
import express from "express";
import validater from "../middlewares/validate.middleware.js";
import User from "../src/models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
const router = express.Router();

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', validater(registerSchema), async(req,res) =>{
    const {username,email,password} = req.body;
    try{
        const existingUser = await User.findOne({ where: { email } });
        if(existingUser){
            return res.status(400).json({message: "Email already registered"});
        }

        const hashedPassword  = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        
        // console.log("New User Created:", newUser.dataValues);
        res.status(201).json({
            message: "User Registered Successfully",
            userId : newUser.id
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
        // Check User Exist
        const userResult = await User.findOne({ where: { email } });
        if(!userResult){
            return res.status(400).json({message : "Register First, User Not Found"});
        }
        // console.log("1")
        const user = userResult.dataValues;
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message : "Invalid Credentials"});
        }
        // console.log("2", user);
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        // console.log("3", accessToken, refreshToken);

        const hashedRefreshToken = hashToken(refreshToken);
        const updatedUser = await User.update({ refreshtoken: hashedRefreshToken }, { where: { id: user.id } });
        // console.log("4", updatedUser);
        res.json({
            message : "Login Successful",
            accessToken,
            refreshToken,
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
        const hashedRefreshToken = hashToken(refreshToken);
        const userResult = await User.findOne({ where: { refreshtoken: hashedRefreshToken } });
        if(!userResult){
            return res.status(403).json({message:"Invalid Refresh Token"});
        }
        const user = userResult.dataValues;
        const accessToken = generateAccessToken(user);
        res.json({
            "message":"Token Refreshed Successfully",
            accessToken
        });
    }
    catch(err){
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
        const hashedRefreshToken = hashToken(refreshToken);
        const userResult = await User.findOne({ where: { refreshtoken: hashedRefreshToken } });

        if(!userResult){
            return res.status(403).json({message:"Invalid Refresh Token"});
        }
        const user = userResult.dataValues;
        // console.log("Logout Debug", user);

        await User.update({ refreshtoken: null }, { where: { id: user.id } });
        res.json({message:"Logged Out Successfully"});
    }
    catch(err){
        res.status(403).json({message:"Server Error Occured While Logout"});
    }
});

export default router;