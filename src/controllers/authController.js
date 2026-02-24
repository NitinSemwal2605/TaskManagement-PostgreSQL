import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import process from "process";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js";

dotenv.config({ quiet: true });

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User Registered Successfully",
            userId: newUser.id,
        });

    } catch (error) {
        console.log("Register Error:", error);
        return res.status(400).json({
            message: "Server Error, Please Check Console",
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check User Exist
        const userResult = await User.findOne({ where: { email } });
        if (!userResult) {
        return res.status(400).json({ message: "Register First, User Not Found" });}

        // Extract User
        const user = userResult.dataValues;
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid Credentials" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        const hashedRefreshToken = hashToken(refreshToken);

        await User.update( { refreshtoken: hashedRefreshToken },{ where: { id: user.id } });

        return res.json({
            message: "Login Successful",
            accessToken,
            refreshToken,
        });
        
    } catch (error) {
        console.log("Login Error:", error);
        return res.status(400).json({
            message: "Server Error Occured",
        });
    }
};

export const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token Required" });
    }

    try {
        // Verify Refresh Token
        const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const hashedRefreshToken = hashToken(refreshToken);

        const userResult = await User.findOne({ where: { refreshtoken: hashedRefreshToken },});
        if (!userResult) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        const user = userResult.dataValues;
        if (decoded.id !== user.id) {
            return res.status(403).json({ message: "Token mismatch" });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        const newHashedRefreshToken = hashToken(newRefreshToken);

        await User.update( { refreshtoken: newHashedRefreshToken }, { where: { id: user.id } });

        return res.json({
            message: "Token Refreshed Successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        console.log("Refresh Error:", error);
        return res.status(403).json({
            message: "Refresh Token Expired",
        });
    }
};


export const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token Required" });
    }

    try {
        const hashedRefreshToken = hashToken(refreshToken);
        const userResult = await User.findOne({where: { refreshtoken: hashedRefreshToken },});

        if (!userResult) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        await User.update({ refreshtoken: null },{ where: { id: userResult.id } });
        return res.json({ message: "Logged Out Successfully" });

    } catch (err) {
        console.log("Logout Error:", err);
        return res.status(403).json({
            message: "Server Error Occured While Logout",
        });
    }
};