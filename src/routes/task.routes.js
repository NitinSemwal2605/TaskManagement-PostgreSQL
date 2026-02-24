import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import Projects from "../models/Project.js";
import Tasks from "../models/Task.js";
import { createTaskSchema, updateStatusSchema, updateTaskSchema } from "../validators/task.validator.js";
const TaskRouter = express.Router();

// Add Task
TaskRouter.post("/addTask/:id", authMiddleware, validate(createTaskSchema), async (req, res) => {
  try{
    const {title,description} = req.body;
    const userId = req.user.id;
    const projectId = req.params.id;


    // Check Project Existance
    const projectExistance = await Projects.findOne({
      where: {
        id: projectId,
        owner_id: userId,
        is_deleted: false
      }
    });

    if(!projectExistance){
      return res.status(404).json({message: "Please check your project id :) "});
    }
    
    const newTask = await Tasks.create({
      title,
      description,
      project_id: projectId,
      created_at: new Date()
    });

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

    // Check Project
    const project = await Projects.findOne({
      where: {
        id: projectId,
        owner_id: userId,
        is_deleted: false
      }
    })

    if(!project){
      return res.status(404).json({message: "Please check your project id :) "});
    }

    // Fetch Tasks
    const tasks = await Tasks.findAndCountAll({
      where: {
        project_id: projectId
      },
      order: [['created_at', 'DESC']]
     });

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
TaskRouter.put("/updateTask/:id", authMiddleware, validate(updateTaskSchema), async (req, res) => {
  try {
    const { title, description } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await Tasks.findOne({
      where: {
        id: taskId
      }
    });

    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }

    const project = await Projects.findOne({
      where: {
        id: task.project_id,
        owner_id: userId,
        is_deleted: false
      }
    });

    if (!project) {
      return res.status(403).json({ message: "Please update your own task :) " });
    }

    if (title) task.title = title;
    if (description) task.description = description;

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", error: err.toString() });
  }
});

// Update Task Status
TaskRouter.patch( "/updateStatus/:id", authMiddleware, validate(updateStatusSchema), async (req, res) => {
    try{
      const { status } = req.body;
      const taskId = req.params.id;
      const userId = req.user.id;
      
      const taskResult = await Tasks.findOne({
        where: {
          id: taskId
        }
      });

      const task = taskResult.dataValues;
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const projectResult = await Projects.findOne({
        where: {
          id: task.project_id,
          owner_id: userId,
          is_deleted: false
        }
      });

      const project = projectResult.dataValues;
      if (!project) {
        return res.status(403).json({ message: "Please update your own task :) " });
      }

      task.status = status;
      const updateResult = await Tasks.update({ status: task.status}, {where: { id: taskId } });

      res.status(200).json({
        message: "Task status updated successfully",
        task: updateResult[0]
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
      const taskResult = await Tasks.findOne({
        where: {
          id: taskId
        }
      });

      const task = taskResult.dataValues;
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // User Verify
      const projectResult = await Projects.findOne({
        where: {
          id: task.project_id,
          owner_id: userId,
          is_deleted: false
        }
      });

      const project = projectResult.dataValues;

      if (!project) {
        return res.status(403).json({ message: "Please delete your own task :) " });
      }

      // Hard Delete
      await Tasks.destroy({where : { id: taskId }});
      console.log("Task Deleted Successfully");
      res.status(200).json({message : "Task Deleted Successfully "});
    }
    catch(err){
      console.log(err);
      res.status(500).json({message : "Internal Server Error", error: err.toString()});
    }
});

export default TaskRouter;