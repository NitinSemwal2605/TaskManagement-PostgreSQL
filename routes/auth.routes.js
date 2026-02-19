import express from "express";
import jwt from "jsonwebtoken";
import validater from "../middlewares/validate.middleware.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
const router = express.Router();
import pool  from "../src/config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', validater(registerSchema), async(req,res) =>{
    const {username,email,password} = req.body;
    try{
        const existingUser = await pool.query(
            'SELECT * FROM Users Where email = $1', [email]
        );

        if(existingUser.rows.length > 0){
            return res.status(400).json({message : "User Already Exists"});
        }


        const hashedPassword  = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO Users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );


        res.status(201).json({
            message: "User Registered Successfully",
            userId : result.rows[0].id
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
        const userResult = await pool.query(
            'SELECT * FROM Users WHERE email = $1', [email]
        );

        if(userResult.rows.length === 0){
            return res.status(400).json({message : "Invalid Credentials"});
        }
        // console.log("1")
        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message : "Invalid Credentials"});
        }
        // console.log("2")
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        console.log("3")
        const hashedRefreshToken = hashToken(refreshToken);
        await pool.query(
            'UPDATE Users SET refreshtoken = $1 WHERE id = $2',
            [hashedRefreshToken, user.id]
        );
        // console.log("4")


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