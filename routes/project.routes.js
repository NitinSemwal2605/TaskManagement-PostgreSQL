import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import Project from "../src/models/Projects.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const ProjectRoute = express.Router();

// Add New Project
ProjectRoute.post( "/add", authMiddleware, validate(createProjectSchema), async (req, res) => {
    const { title, description , location} = req.body;
    // console.log("Request Body : ", req.body);
    try{
      const projectData = {
        title,
        description,
        owner: req.user.id
      };

      // Check Location Valid
      if(location && Array.isArray(location.coordinates) && location.coordinates.length === 2){
        projectData.location = {
          type: "Point",
          coordinates: location.coordinates
        }
      }

      console.log("Project Data : ", projectData);
      // Create and Save Project
      const project = new Project(projectData);
      await project.save();

      res.status(201).json({
        message: "Project Added Successfully",
        project
      });
    }
    catch(error){
      console.log("Error in Adding Project : ", error);
      res.status(400).json({message: "Server Error Occured"});
    }
  }
);



// Add Multiple Projects
ProjectRoute.post("/add-multiple", authMiddleware, async (req, res) => {
  try{
    const projectsData = req.body.projects;
    const projects = await Project.insertMany(
      projectsData.map(proj => ({...proj, owner: req.user.id}))
    );

    res.status(201).json({
      message: "Multiple Projects Added Successfully",
      projects
    });
  }
  catch(error){
    console.log("Error in Adding Multiple Projects : ", error);
    res.status(400).json({message: "Server Error Occured"});
  }
});



// Get All Projects with Pagination
ProjectRoute.get("/list", authMiddleware, async (req, res) => {
  try{
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const projects = await Project.find({owner: req.user.id}).skip(skip).limit(limit);
    const total = await Project.countDocuments({owner: req.user.id});

    res.status(200).json({
      message: "Projects Listed Successfully",
      projects,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  }
  catch(error){
    console.log("Error in Listing Project : ", error);
      res.status(400).json({message: "Server Error Occured"});
  }
});



// Get Project by ID
ProjectRoute.get("/list/:id", authMiddleware, async (req, res) => {
  try{
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.id
    })
    if(!project){
      return res.status(404).json({message: "Project Not Found"});
    }
    res.status(200).json({
      message: "Project Fetched Successfully",
      project
    });
  } catch(error){
    console.log("Error in Fetching Project : ", error);
    res.status(400).json({message: "Server Error Occured"});
  }
});

// Update Project
ProjectRoute.patch( "/update/:id", authMiddleware, validate(updateProjectSchema), async (req, res) => {
    try{
      const {title, description, location} = req.body;

      const project = await Project.findOneAndUpdate({
        _id: req.params.id,
        owner: req.user.id
      }, {
        title,
        description,
        location: location && location.length === 2 ? {
          type: "Point",
          coordinates: location
        } : undefined
      }, { new: true }); // Return Updated Document
      
      if(!project){
        return res.status(404).json({message: "Project Not Found"});
      }

      if(title){
        project.title = title;
      }
      if(description){
        project.description = description;
      }
      if(location && location.length === 2){
        project.location = {
          type: "Point",
          coordinates: location
        }
      }
      await project.save();
    }
    catch(error){
      console.log("Error in Updating Project :", error);
      res.status(400).json({message: "Server Error Occured"});
    }
  }
);


// Soft Delete Project
ProjectRoute.delete("/delete/:id", authMiddleware, async (req, res) => {
  try{
      const project = await Project.findOneAndUpdate({
          _id: req.params.id,
          owner: req.user.id,
          isDeleted: false
      }, {
        isDeleted: true
      });
      
      if(!project){
          return res.status(404).json({message: "Project Not Found"});
      }
      
      await project.save();
  }
  catch(error){
    console.log("Error in Deleting Project :", error);
    res.status(400).json({message: "Server Error Occured"});
  }
});

// Restore Deleted Project
ProjectRoute.post("/restore/:id", authMiddleware, async (req, res) => {
  try{
      const project = await Project.findOneAndUpdate({
          _id: req.params.id,
          owner: req.user.id,
          isDeleted: true
      }, {
        isDeleted: false
      });
      
      if(!project){
          return res.status(404).json({message: "Project Not Found or Not Deleted"});
      }

      await project.save();
  }
  catch(error){
    console.log("Error in Restoring Project :", error);
    res.status(400).json({message: "Server Error Occured"});
  }
});

export default ProjectRoute;
