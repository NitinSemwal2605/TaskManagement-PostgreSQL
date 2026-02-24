import Project from "../models/Project.js";

export const addProject = async (req, res) => {
    const { title, description, location } = req.body;

    try {
        const result = await Project.create({
            title,
            description,
            location: location || null,
            owner_id: req.user.id,
            created_at: new Date()
        });

        res.status(201).json({
            message: "Project Added Successfully",
            project: result.dataValues
        });
        
    } catch (error) {
        console.log("Error in Adding Project:", error);
        res.status(400).json({
            message: "Error Occured While Adding Project"
        });
    }
};

export const addMultipleProjects = async (req, res) => {
    try {
        const projectsData = req.body.projects;
        const projects = [];

        for (const data of projectsData) {
        const { title, description, location } = data;

        const result = await Project.create({
            title,
            description,
            location: location || null,
            owner_id: req.user.id
        });

        projects.push(result.dataValues);
        }

        res.status(201).json({
            message: "Multiple Projects Added Successfully",
            projects
        });
    }
    catch (error) {
        console.log("Error in Adding Multiple Projects:", error);
        res.status(400).json({
            message: "Error Occured While Adding Multiple Projects"
        });
    }
};

export const listProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const projects = await Project.findAndCountAll({
            where: { owner_id: req.user.id},
            offset: skip,
            limit,
            order: [["created_at", "DESC"]]
        });

        res.status(200).json({
            message: "Projects Listed Successfully",
            projects: projects.rows,
            total: projects.count,
            page: Number(page),
            limit: Number(limit)
        });
    }
    catch (error) {
        console.log("Error in Listing Project:", error);
        res.status(400).json({
            message: "Error Occured While Listing Projects"
        });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const result = await Project.findOne({
            where: {
                id: req.params.id,
                owner_id: req.user.id
            }
        });

        if (!result) {
            return res.status(404).json({ message: "Project Not Found" });
        }

        res.status(200).json({
            message: "Project Fetched Successfully",
            project: result.dataValues
        });
    }
    
    catch (error) {
        console.log("Error in Fetching Project:", error);
        
        res.status(400).json({
            message: "Error Occured While Fetching Project",
            error: error.toString()
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { title, description, location } = req.body;

        const result = await Project.findOne({
            where: {
                id: req.params.id,
                owner_id: req.user.id
            }
        });

        if (!result) {
        return res.status(404).json({ message: "I Guess It's Not Your Project" });
        }

        if (title){
            result.title = title;
        }
        if (description){
            result.description = description;
        }
        if (location !== undefined && location !== null) {
            result.location = location;
        }

        await result.save();

        res.status(200).json({
            message: "Project Updated Successfully",
            project: result.dataValues
        });

    }
    catch (error) {
        console.log("Error in Updating Project:", error);
        
        res.status(400).json({
            message: "Error Occured While Updating Project",
            error: error.toString()
        });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const result = await Project.findOne({
        where: {
            id: req.params.id,
            owner_id: req.user.id
        }});

        if (!result) {
            return res.status(404).json({ message: "Project Not Found" });
        }

        await Project.destroy({ where: { id: req.params.id, owner_id: req.user.id}});

        res.status(200).json({
            message: "Project Deleted Successfully"
        });
    }
    catch (error) {
        console.log("Error in Deleting Project:", error);
        
        res.status(400).json({
            message: "Error Occured While Deleting Project",
            error: error.toString()
        });
    }
};