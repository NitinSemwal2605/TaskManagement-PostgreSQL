import redisClient from "../config/redis.js";
import Tasks from "../models/Task.js";
import { getMembership } from "../utils/projectAccess.js";

// Only Owner and Members can Add Task.
export const addTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const projectId = req.params.id;

        const membership = await getMembership(req.user.id, projectId);

        if (!membership || (membership.role !== 'admin' && membership.role !== "owner" && membership.role !== "member")) {
            return res.status(403).json({ message: "You don't have access to this project" });
        }

        const newTask = await Tasks.create({
            title,
            description,
            project_id: projectId,
            created_at: new Date()
        });

        res.status(201).json({ message: "Task created successfully",
            task: newTask
        });
        
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.toString()
        });
    }
};

// Anyone from Project can list tasks.
export const listTasks = async (req, res) => {
    try {
        const projectId = req.params.id;

        const membership = await getMembership(req.user.id, projectId);
        if (!membership) {
            return res.status(403).json({ message: "You don't have access to this project" });
        }

        const tasks = await Tasks.findAndCountAll({
            where: { project_id: projectId},
            order: [["created_at", "DESC"]]
        });

        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks: tasks.rows
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.toString()
        });
    }
};

// Only Owner can Update Task.
export const updateTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const taskId = req.params.id;

        const task = await Tasks.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(req.user.id, task.project_id);
        if (!membership || membership.role !== "owner") {
            return res.status(403).json({ message: "You don't have access to update this task" });
        }

        if (title){
            task.title = title;
        }
        if (description){
            task.description = description;
        }

        await task.save();
        const key = `user:${req.user.id}:role:task:id:${taskId}`;

        redisClient.del(key);

        res.status(200).json({
            message: "Task updated successfully",
            task
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.toString()
        });
    }
};

// Only Members Can Update Task Status.
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const taskId = req.params.id;

        const task = await Tasks.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(req.user.id, task.project_id);
        if (!membership || (membership.role !== "owner" && membership.role !== "member")) {
            return res.status(403).json({ message: "You don't have access to update this task status" });
        }

        task.status = status;
        await task.save();

        const key = `user:${req.user.id}:role:task:id:${taskId}`;
        redisClient.del(key);

        res.status(200).json({
            message: "Task status updated successfully",
            task
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.toString()
        });
    }
};


// Only Owner can Delete Task.
export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        const task = await Tasks.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const membership = await getMembership(req.user.id, task.project_id);
        if (!membership || membership.role !== "owner") {
            return res.status(403).json({ message: "You don't have access to delete this task" });
        }

        const key = `user:${req.user.id}:role:task:id:${taskId}`;
        redisClient.del(key);

        await Tasks.destroy({ where: { id: taskId }});

        res.status(200).json({
            message: "Task Deleted Successfully"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error",
            error: err.toString()
        });
    }
};