import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import process from "process";

dotenv.config({quiet:true});

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" } // Edit
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
