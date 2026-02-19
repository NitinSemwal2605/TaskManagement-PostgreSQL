import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import Project from "../src/models/Projects.js";
import Task from "../src/models/Tasks.js";
import { createTaskSchema, updateStatusSchema, updateTaskSchema } from "../validators/task.validator.js";

const TaskRouter = express.Router();

TaskRouter.post("/addTask/:id", authMiddleware, validate(createTaskSchema), async (req, res) => {
  try{
    const {title,description} = req.body;
    const userId = req.user.id;
    const projectId = req.params.id;
    // console.log("project Id : ", projectId);
    // console.log("User id :", userId);

    const project = await Project.findOne({
      _id : projectId,
      owner: userId,
      isDeleted: false
    });
    
    if(!project){
      return res.status(404).json({message: "Please Add to Your Project :) "});
    }

    const newTask = await Task.create({
      title,
      description,
      project: projectId
    });
    
    res.status(201).json({
      message: "Task created successfully",
      task: newTask
    });
  }
  catch(err){
    console.error(err);
    res.status(500).json({message : "Internal Server Error"});
  }
});



TaskRouter.get("/list/:id", authMiddleware, async (req, res) => {
  try{
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await Project.findOne({
      _id : projectId,
      owner: userId,
      isDeleted: false
    });
    
    if(!project){
      return res.status(404).json({message: "Please check your project id :) "});
    }

    const tasks = await Task.find({
      project: projectId,
      isDeleted: false
    });

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks
    });
  }
  catch(err){
    console.error(err);
    res.status(500).json({message : "Internal Server Error"});
  }
});


TaskRouter.put( "/updateTask/:id", authMiddleware, validate(updateTaskSchema), async (req, res) => {
    try{
      const { title, description } = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;

      const task = await Task.findOne({
        _id: taskId,
        isDeleted: false
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const project = await Project.findOne({
        _id: task.project,
        owner: userId,
        isDeleted: false
      });

      if (!project) {
        return res.status(403).json({ message: "Please update your own task :) " });
      }

      if(title){
        task.title = title;
      }
      if(description){
        task.description = description;
      }

      await task.save();

      res.status(200).json({
        message: "Task updated successfully",
        task
      });
    }
    catch(err){
      console.error(err);
      res.status(500).json({message : "Internal Server Error"});
    }
  }
);

TaskRouter.patch( "/updateStatus/:id", authMiddleware, validate(updateStatusSchema), async (req, res) => {
    try{
      const { status } = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;
      
      const task = await Task.findOne({
        _id: taskId,
        isDeleted: false
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const project = await Project.findOne({
        _id: task.project,
        owner: userId,
        isDeleted: false
      });

      if (!project) {
        return res.status(403).json({ message: "Please update your own task :) " });
      }
      
      task.status = status;
      res.status(200).json({
        message: "Task status updated successfully",
        task
      });
    }
    catch(error){
      console.error(err);
      res.status(500).json({message : "Internal Server Error"});
    }
  }
);

TaskRouter.delete("/deleteTask/:id", authMiddleware, async (req, res) => {
    try{
      const taskId = req.params.id;
      const userId = req.user.id;

      const task = await Task.findOne({
        _id: taskId,
        isDeleted: false
      });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const project = await Project.findOne({
        _id: task.project,
        owner: userId,
        isDeleted: false
      });

      if (!project) {
        return res.status(403).json({ message: "Please delete your own task :) " });
      }

      task.isDeleted = true;
      await task.save();

      res.status(200).json({
        message: "Task deleted successfully"
      });
    }
    catch(err){
      console.error(err);
      res.status(500).json({message : "Internal Server Error"});
    }
});

export default TaskRouter;