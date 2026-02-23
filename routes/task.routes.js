import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import pool from "../src/config/db.js";
import { createTaskSchema, updateStatusSchema, updateTaskSchema } from "../validators/task.validator.js";

const TaskRouter = express.Router();

// Add Task
TaskRouter.post("/addTask/:id", authMiddleware, validate(createTaskSchema), async (req, res) => {
  try{
    const {title,description} = req.body;
    const userId = req.user.id;
    const projectId = req.params.id;
    // console.log("project Id : ", projectId);
    // console.log("User id :", userId);

    // Check Project Existance
    const project = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id  = $2 AND is_deleted = false',
    [projectId, userId]);

    if(project.rows.length === 0){
      return res.status(404).json({message: "Please check your project id :) "});
    }

    const result = await pool.query(
      'INSERT INTO Tasks (title, description, project_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, projectId]
    );

    const newTask = result.rows[0];
    
    res.status(201).json({
      message: "Task created successfully",
      task: newTask
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({message : "Internal Server Error"});
  }
});

// Get Tasks by Project Id
TaskRouter.get("/list/:id", authMiddleware, async (req, res) => {
  try{
    const userId = req.user.id;
    const projectId = req.params.id;
    const project = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
    [projectId, userId]);
    
    if(project.rows.length === 0){
      return res.status(404).json({message: "Please check your project id :) "});
    }

    const tasks = await pool.query('SELECT * FROM Tasks WHERE project_id = $1 AND is_deleted = false',
    [projectId]);

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks: tasks.rows
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({message : "Internal Server Error", error: err.toString()});
  }
});


// Update Task
TaskRouter.put( "/updateTask/:id", authMiddleware, validate(updateTaskSchema), async (req, res) => {
    try{
      const { title, description } = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;

      const taskResult = await pool.query('SELECT * FROM Tasks WHERE id = $1 AND is_deleted = false',
      [taskId]);

      const task = taskResult.rows[0];
      if(!task){
        return res.status(404).json({message: "Task Not Found"});
      }

      const projectResult = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
      [task.project_id, userId]);

      const project = projectResult.rows[0];
      if(!project){
        return res.status(403).json({message: "Please update your own task :) "});
      }

      if(title){
        task.title = title;
      }
      if(description){
        task.description = description;
      }

      const updateResult = await pool.query('UPDATE Tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *',
      [task.title, task.description, taskId]);

      res.status(200).json({
        message: "Task updated successfully",
        task: updateResult.rows[0]
      });
    }
    catch(err){
      console.log(err);
      res.status(500).json({message : "Internal Server Error", error: err.toString()});
    }
  }
);

// Update Task Status
TaskRouter.patch( "/updateStatus/:id", authMiddleware, validate(updateStatusSchema), async (req, res) => {
    try{
      const { status } = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;
      
      const taskResult = await pool.query('SELECT * FROM Tasks WHERE id = $1 AND is_deleted = false',
      [taskId]);

      const task = taskResult.rows[0];
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const projectResult = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
      [task.project_id, userId]);

      const project = projectResult.rows[0];
      if (!project) {
        return res.status(403).json({ message: "Please update your own task :) " });
      }

      task.status = status;
      const updateResult = await pool.query('UPDATE Tasks SET status = $1 WHERE id = $2 RETURNING *',
      [task.status, taskId]);

      res.status(200).json({
        message: "Task status updated successfully",
        task: updateResult.rows[0]
      });
    }
    catch(error){
      console.log(error);
      res.status(500).json({message : "Internal Server Error", error: error.toString()});
    }
  }
);

// Delete Task (Hard Delete)
TaskRouter.delete("/deleteTask/:id", authMiddleware, async (req, res) => {
    try{
      const taskId = req.params.id;
      const userId = req.user.id;

      // Task Check
      const taskResult = await pool.query('SELECT * FROM Tasks WHERE id = $1 AND is_deleted = false',
      [taskId]);

      const task = taskResult.rows[0];
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // User Verify
      const projectResult = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
      [task.project_id, userId]);

      const project = projectResult.rows[0];
      if (!project) {
        return res.status(403).json({ message: "Please delete your own task :) " });
      }

      await pool.query('DELETE FROM Tasks WHERE id = $1', [taskId]);
      console.log("Task Deleted Successfully");
      res.status(200).json({message : "Task Deleted Successfully "});
    }
    catch(err){
      console.log(err);
      res.status(500).json({message : "Internal Server Error", error: err.toString()});
    }
});

export default TaskRouter;