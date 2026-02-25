import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import process from "process";
import Session from "../models/session.js";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, hashToken } from "../utils/token.js";
import crypto from 'crypto';

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

        const sessionId = crypto.randomUUID();

        const accessToken = generateAccessToken(user, sessionId);
        const refreshToken = generateRefreshToken(user, sessionId);

        const hashedRefreshToken = hashToken(refreshToken);

         // Create Session
        await Session.create({
            id : sessionId,
            userId: user.id,
            refreshTokenHash : hashedRefreshToken,
            ipAddress: req.ip,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })

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
        const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const session = await Session.findOne({
            where: { id: decoded.sessionId, status: "Online" }
        })

        if(!session){
            return res.status(403).json({ message: "Session Not Found or Invalid" });
        }

        const userResult = await User.findOne({ where: { id: decoded.sub } });
        if (!userResult) {
            return res.status(403).json({ message: "User Not Found" });
        }

        const user = userResult.dataValues;
        const hashedRefreshToken = hashToken(refreshToken);

        if (hashedRefreshToken !== session.refreshTokenHash) {
            await Session.update(
                { status: "Revoked" },
                { where: { id: session.id } }
            );
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        const newAccessToken = generateAccessToken(user, session.id);
        const newRefreshToken = generateRefreshToken(user, session.id);
        const newHashedRefreshToken = hashToken(newRefreshToken);

        await Session.update(
            { refreshTokenHash: newHashedRefreshToken },
            { where: { id: session.id } }
        );

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
        const decoded = jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const session = await Session.findOne({
            where: { id: decoded.sessionId, status: "Online" }
        })

        if(!session){
            return res.status(403).json({ message: "Session Not Found or Invalid" });
        }

        const hashedRefreshToken = hashToken(refreshToken);

        if (hashedRefreshToken !== session.refreshTokenHash) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        await Session.update(
            { status: "Offline" },
            { where: { id: session.id } }
        );

        return res.json({
            message: "Logout Successful ",
        });

    } catch (err) {
        console.log("Logout Error:", err);
        return res.status(403).json({
            message: "Server Error Occured While Logout",
        });
    }
};