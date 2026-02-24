import express from "express";
import { addTask, deleteTask, listTasks, updateStatus, updateTask } from "../controllers/taskController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createTaskSchema, updateStatusSchema, updateTaskSchema } from "../validators/task.validator.js";

const TaskRouter = express.Router();

TaskRouter.post( "/addTask/:id", authMiddleware, validate(createTaskSchema), addTask);
TaskRouter.get("/list/:id",authMiddleware,listTasks);
TaskRouter.put("/updateTask/:id", authMiddleware,validate(updateTaskSchema), updateTask);
TaskRouter.patch( "/updateStatus/:id",authMiddleware, validate(updateStatusSchema),updateStatus);
TaskRouter.delete("/deleteTask/:id",authMiddleware,deleteTask);

export default TaskRouter;