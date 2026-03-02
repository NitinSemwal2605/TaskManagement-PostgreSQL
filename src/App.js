import dotenv from "dotenv";
import express from "express";
import path from "path";
import process from "process";
import authRoute from "../src/routes/auth.routes.js";
import ProjectRoute from "../src/routes/project.routes.js";
import TaskRoute from "../src/routes/task.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
dotenv.config({ quiet: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
app.use("/projects", ProjectRoute);
app.use("/tasks", TaskRoute);
app.use("/chats", chatRoutes);

app.use(express.static(path.join(process.cwd(), "public")));

app.use((req, res) => {
  res.status(404).send("Server is Running But Page Not Found :) ");
});

export default app;