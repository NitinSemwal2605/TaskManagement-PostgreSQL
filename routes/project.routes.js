import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import pool from "../src/config/db.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";

const ProjectRoute = express.Router();

// Add New Project
ProjectRoute.post( "/add", authMiddleware, validate(createProjectSchema), async (req, res) => {
    const { title, description , location} = req.body;
    // console.log("Request Body : ", req.body);
    try{
      const result = await pool.query(
        'INSERT INTO Projects (title, description, location, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, location ? JSON.stringify(location) : null, req.user.id]
      );
      console.log("Project: ", result);
      const project = result.rows[0];

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
    const projects = [];
    for(const data of projectsData){
      const { title, description, location } = data;
      const result = await pool.query(
        'INSERT INTO Projects (title, description, location, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, location ? JSON.stringify(location) : null, req.user.id]
      );
      projects.push(result.rows[0]);
    }

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const projects = await pool.query('SELECT * FROM Projects WHERE owner_id = $1 AND is_deleted = false ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [req.user.id, limit, skip]);

    console.log('Projects :', projects);

    const totalResult = await pool.query('SELECT COUNT(*) FROM Projects WHERE owner_id = $1 AND is_deleted = false',
    [req.user.id]);
    
    const total = parseInt(totalResult.rows[0].count);
    console.log("Total",total);

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
      res.status(400).json({message: "Server Error Occured"});
  }
});



// Get Project by ID
ProjectRoute.get("/list/:id", authMiddleware, async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
    [req.params.id, req.user.id]);

    const project = result.rows[0];

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

      const result = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2 AND is_deleted = false',
      [req.params.id, req.user.id]);
      // console.log("1");
      const project = result.rows[0];
      // console.log("2");
      if(!project){
        return res.status(404).json({message: "Project Not Found"});
      }
      // console.log("3");
      if(title){
        project.title = title;
      }
      if(description){
        project.description = description;
      }
      if(location !== undefined && location !== null){
        project.location = location;
      }
      await pool.query(
        'UPDATE Projects SET title = $1, description = $2, location = $3 WHERE id = $4 AND owner_id = $5',
        [project.title, project.description,project.location ? JSON.stringify(project.location) : null, project.id, req.user.id]
      );

      res.status(200).json({
        message: "Project Updated Successfully",
        project
      });
    }

    catch(error){
      console.log("Error in Updating Project :", error);
      res.status(400).json({message: "Server Error Occured", error: error.toString()});
    }
  }
);


// Hard Delete Project
ProjectRoute.delete("/delete/:id", authMiddleware, async (req, res) => {
  try{
      // Check Existance
      const project = await pool.query('SELECT * FROM Projects WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]);

      if(project.rows.length === 0){
        return res.status(404).json({message: "Project Not Found"});
      }

      await pool.query('DELETE FROM Projects WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]);
      
      res.status(200).json({message: "Project Deleted Successfully"});
  }
  catch(error){
    console.log("Error in Deleting Project :", error);
    res.status(400).json({message: "Server Error Occured"});
  }
});

export default ProjectRoute;
