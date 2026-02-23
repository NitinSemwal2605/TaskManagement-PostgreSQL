import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import Project from "../src/models/Project.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const ProjectRoute = express.Router();

// Add New Project
ProjectRoute.post( "/add", authMiddleware, validate(createProjectSchema), async (req, res) => {
    const { title, description , location} = req.body;
    try{
      const result = await Project.create({
        title,
        description,
        location: location ? JSON.stringify(location) : null,
        owner_id: req.user.id,
        created_at: new Date()
      });

      const project = result.dataValues;

      res.status(201).json({
        message: "Project Added Successfully",
        project
      });
    }
    catch(error){
      console.log("Error in Adding Project : ", error);
      res.status(400).json({message: "Error Occured While Adding Project"});
    }
  }
);

// Add Multiple Projects
ProjectRoute.post("/add-multiple", authMiddleware, async (req, res) => {
  try{
    const projectsData = req.body.projects;
    const projects = [];
    for(const data of projectsData){
      const { title, description, location } = data;
      const result = await Project.create({
        title,
        description,
        location: location ? JSON.stringify(location) : null,
        owner_id: req.user.id
      });
      projects.push(result.dataValues);
    }

    res.status(201).json({
      message: "Multiple Projects Added Successfully",
      projects
    });
  }
  catch(error){
    console.log("Error in Adding Multiple Projects : ", error);
    res.status(400).json({message: "Error Occured While Adding Multiple Projects"});
  }
});



// Get All Projects with Pagination
ProjectRoute.get("/list", authMiddleware, async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const projects = await Project.findAndCountAll({
      where: {
        owner_id: req.user.id,
        is_deleted: false
      },
      offset: skip,
      limit: limit,
      order: [['created_at', 'DESC']]
    });

    const total = projects.count;

    res.status(200).json({
      message: "Projects Listed Successfully",
      projects: projects.rows,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  }
  catch(error){
    console.log("Error in Listing Project : ", error);
      res.status(400).json({message: "Error Occured While Listing Projects"});
  }
});



// Get Project by ID
ProjectRoute.get("/list/:id", authMiddleware, async (req, res) => {
  try{
    const result = await Project.findOne({
      where: {
        id: req.params.id,
        owner_id: req.user.id,
        is_deleted: false
      }
    });

    if(!result){
      return res.status(404).json({message: "Project Not Found"});
    }

    const project = result.dataValues;
    
    res.status(200).json({
      message: "Project Fetched Successfully",
      project
    });

  } catch(error){
    console.log("Error in Fetching Project : ", error);
    res.status(400).json({message: "Error Occured While Fetching Project"});
  }
});

// Update Project
ProjectRoute.patch("/update/:id", authMiddleware, validate(updateProjectSchema), async (req, res) => {
  try {
    const { title, description, location } = req.body;

    const result = await Project.findOne({
      where: {
        id: req.params.id,
        owner_id: req.user.id,
        is_deleted: false
      }
    });

    if (!result) {
      return res.status(404).json({ message: "I Guess It's Not Your Project" });
    }

    if (title) result.title = title;
    if (description) result.description = description;
    if (location !== undefined && location !== null) {
      result.location = location;
    }

    await result.save();

    res.status(200).json({
      message: "Project Updated Successfully",
      project: result.dataValues
    });

  } catch (error) {
    console.log("Error in Updating Project :", error);
    res.status(400).json({
      message: "Error Occured While Updating Project",
      error: error.toString()
    });
  }
});

// Hard Delete Project
ProjectRoute.delete("/delete/:id", authMiddleware, async (req, res) => {
  try{
      // Check Existance
      const result = await Project.findOne({
        where: {
          id: req.params.id,
          owner_id: req.user.id,
          is_deleted: false
        }
      });
      
      if(!result){
        return res.status(404).json({message: "Project Not Found"});
      }

      // Hard Delete
      const projectDeleted = await Project.destroy({
        where: {
          id: req.params.id,
          owner_id: req.user.id
        }
      });

      console.log("Project Deleted : ", projectDeleted);
      res.status(200).json({message: "Project Deleted Successfully"});
  }
  catch(error){
    console.log("Error in Deleting Project :", error);
    res.status(400).json({message: "Error Occured While Deleting Project"});
  }
});

export default ProjectRoute;
