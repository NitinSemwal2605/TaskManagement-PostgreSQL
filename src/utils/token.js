import crypto from 'crypto';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import process from "process";

dotenv.config({quiet:true});

export const generateAccessToken = (user, sessionId) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      sessionId
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "60m" }
  );
};

export const generateRefreshToken = (user, sessionId) => {
  return jwt.sign(
    {
      userId: user.id,
      sessionId
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};


export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}