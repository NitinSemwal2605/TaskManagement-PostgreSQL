import express from "express";
import { addMultipleProjects, addProject, deleteProject, getProjectById, listProjects, updateProject } from "../controllers/projectController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const ProjectRoute = express.Router();

ProjectRoute.post("/add", authMiddleware, validate(createProjectSchema), addProject);
ProjectRoute.post("/add-multiple", authMiddleware, addMultipleProjects);
ProjectRoute.get("/list", authMiddleware, listProjects);
ProjectRoute.get("/list/:id", authMiddleware, getProjectById);
ProjectRoute.patch("/update/:id", authMiddleware, validate(updateProjectSchema), updateProject);
ProjectRoute.delete("/delete/:id", authMiddleware, deleteProject);

export default ProjectRoute;