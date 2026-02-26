import Projects from "../models/Project.js";
import Tasks from "../models/Task.js";
import redisClient from "../config/redis.js";

export const addTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;
        const projectId = req.params.id;

        const projectExistance = await Projects.findOne({
            where: {
                id: projectId,
                owner_id: userId
            }
        });

        if (!projectExistance) {
            return res.status(404).json({ message: "Please check your project id :) " });
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

export const listTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;

        const project = await Projects.findOne({
            where: {
                id: projectId,
                owner_id: userId
            }
        });

        if (!project) {
            return res.status(404).json({ message: "Please check your project id :) "});
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

export const updateTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const taskId = req.params.id;
        const userId = req.user.id;

        const task = await Tasks.findOne({
            where: { id: taskId }
        });

        if (!task) {
        return res.status(404).json({
            message: "Task Not Found"
        });
        }

        const project = await Projects.findOne({
            where: {
                id: task.project_id,
                owner_id: userId
            }
        });

        if (!project) {
            return res.status(403).json({ message: "Please update your own task :) " });
        }

        if (title){
            task.title = title;
        }
        if (description){
            task.description = description;
        }

        await task.save();
        const key = `user:${userId}:role:task:id:${taskId}`;
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

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const taskId = req.params.id;
        const userId = req.user.id;

        const task = await Tasks.findOne({
            where: { id: taskId }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found"});
        }

        const project = await Projects.findOne({
            where: {
                id: task.project_id,
                owner_id: userId
            }
        });

        if (!project) {
            return res.status(403).json({ message: "Please update your own task :) "});
        }

        task.status = status;
        await task.save();

        const key = `user:${userId}:role:task:id:${taskId}`;
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

export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const task = await Tasks.findOne({
            where: { id: taskId }
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found"});
        }

        const project = await Projects.findOne({
            where: {
                id: task.project_id,
                owner_id: userId
            }
        });

        if (!project) {
            return res.status(403).json({message: "Please delete your own task :) "});
        }

        const key = `user:${userId}:role:task:id:${taskId}`;
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