import dotenv from "dotenv";
import express from "express";
import path from "path";
import authRoute from "../routes/auth.routes.js";
// import ProjectRoute from "../routes/project.routes.js";
// import TaskRoute from "../routes/task.routes.js";

const app = express();
dotenv.config({ quiet: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoute);
// app.use("/projects", ProjectRoute);
// app.use("/tasks", TaskRoute);

app.use(express.static(path.join(process.cwd(), "public")));

app.use((req, res) => {
  res.status(404).send("Server is Running But Page Not Found :) ");
});

export default app;
