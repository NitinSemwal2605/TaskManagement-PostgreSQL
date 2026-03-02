import express from "express";
import { getMessages } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const chatRoutes = express.Router();

// Get messages for a project
chatRoutes.get("/:projectId/messages", authMiddleware, getMessages);

export default chatRoutes;