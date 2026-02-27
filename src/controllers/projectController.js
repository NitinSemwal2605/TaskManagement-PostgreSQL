import redisClient from "../config/redis.js";
import sequelize from "../config/sequelize.js";
import Project from "../models/Project.js";
import ProjectMember from "../models/ProjectMember.js";
import User from "../models/User.js";

export const addProject = async (req, res) => {
    const transaction = await sequelize.transaction();
    const { title, description, location } = req.body;

    try {
        // Created a Project in DB
        const result = await Project.create({
            title,
            description,
            location: location || null,
            created_at: new Date()
        } , { transaction });

        // Creator Will be the Owner of the Project
        await ProjectMember.create({
            user_id: req.user.id,
            project_id: result.id,
            role: "owner",
            created_at: new Date()
        }, { transaction});

        await transaction.commit();

        res.status(201).json({
            message: "Project Added Successfully",
            project: result.dataValues
        });
        
    } catch (error) {
        await transaction.rollback();
        console.log("Error in Adding Project:", error);
        res.status(400).json({
            message: "Error Occured While Adding Project"
        });
    }
};

export const addMultipleProjects = async (req, res) => {
    const transaction = await sequelize.transaction(); // Start Transaction
    try {
        const projectsData = req.body.projects;
        const projects = [];

        for (const data of projectsData) {
            const { title, description, location } = data;
            // Create Project in DB
            const result = await Project.create({
                title,
                description,
                location: location || null,
                owner_id: req.user.id
            }, { transaction });

            // Creater will be Owner
            await ProjectMember.create({
                user_id: req.user.id,
                project_id: result.id,
                role: "owner",
                created_at: new Date()
            }, { transaction });

            projects.push(result.dataValues);
        }

        await transaction.commit();

        res.status(201).json({
            message: "Multiple Projects Added Successfully",
            projects
        });
    }
    catch (error) {
        await transaction.rollback(); // Rollback Transaction
        console.log("Error in Adding Multiple Projects:", error);
        res.status(400).json({
            message: "Error Occured While Adding Multiple Projects"
        });
    }
};

//To get All Projects of a User (Only Projects in which this User is Involved)
export const listProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Fetch Projects Where this User involved
        const {count , rows} = await Project.findAndCountAll({
            include :[
                {
                    // model: ProjectMember,
                    association : "members",
                    where: { user_id: req.user.id },
                    attributes: []
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: "Projects Listed Successfully",
            projects: rows,
            total: count,
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


// To get a Single Project by ID (Only if this User is Involved in that Project)
export const getProjectById = async (req, res) => {
    try {
        // Fetch Project Where this User involved
        const project = await Project.findOne({
            where : {id : req.params.id},
            include : [
                {
                    association : "members",
                    where: { user_id: req.user.id },
                    attributes: []
                }
            ]
        });

        if (!project) {
            return res.status(404).json({ message: "Project Not Found" });
        }

        res.status(200).json({
            message: "Project Fetched Successfully",
            project: project.dataValues
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


//Add New Project Members
export const AddMembers = async (req,res) =>{
    const transaction = await sequelize.transaction();
    try{
        const project_id = req.params.projectId;
        const {members} = req.body;

        //Check Project Exist
        const project = await Project.findByPk(project_id);
        if(!project){
            return res.status(404).json({message : "Project Not Found"});
        }

        //Only Owner Can Add New Members
        const memberShip = await ProjectMember.findOne({
            where: {
                user_id: req.user.id,
                project_id: project_id,
                role : "owner"
            }
        });

        if(!memberShip) {
            return res.status(403).json({ message: "Only Owner Can Add New Members" });
        }

        const newMembers = [];
        
        for(const member of members){
            const { user_id, role = "member" } = member;

            const user = await User.findByPk(user_id);
            if (!user) {
                return res.status(404).json({ message: "User Not Found" });
            }

            const existingMember = await ProjectMember.findOne({
                where: {
                    user_id,
                    project_id
                }
            });
            
            if (existingMember) {
                continue;
            }

            newMembers.push({
                user_id,
                project_id,
                role,
                created_at: new Date()
            }, { transaction });


            await ProjectMember.create({
                user_id,
                project_id,
                role,
                created_at: new Date()
            }, { transaction });
        }
        
        await transaction.commit();
        res.status(200).json({
            message: "New Members Added Successfully",
            count: newMembers.length
        });
    }
    catch (error) {
        await transaction.rollback();
        console.log("Error in Adding New Members:", error);
        
        res.status(400).json({
            message: "Error Occured While Adding New Members",
            error: error.toString()
        });
    }
};


export const listProjectMembers = async (req, res) => {
    try {
        const project_id = req.params.projectId;

        // Check Project Exist
        const project = await Project.findByPk(project_id);
        if (!project) {
            return res.status(404).json({ message: "Project Not Found" });
        }

        // Fetch Members of this Project
        const members = await ProjectMember.findAll({
            where: { project_id },
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "username", "email"]
                }
            ]
        });

        res.status(200).json({
            message: "Project Members Listed Successfully",
            members: members.map(member => ({
                id: member.user.id,
                name: member.user.username,
                email: member.user.email,
                role: member.role
            }))
        });
    }
    catch (error) {
        console.log("Error in Listing Project Members:", error);
        
        res.status(400).json({
            message: "Error Occured While Listing Project Members",
            error: error.toString()
        });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { title, description, location } = req.body;

        // Only Owner Can Update Project
        const memberShip = await ProjectMember.findOne({
            where: {
                user_id: req.user.id,
                project_id: req.params.id
            }
        });

        if(!memberShip || memberShip.role !== "owner") {
            return res.status(403).json({ message: "Only Owner Can Update the Project" });
        }

        // Fetch Project
        const project = await Project.findByPk(req.params.id);

        if (title){
            project.title = title;
        }
        if (description){
            project.description = description;
        }
        if (location !== undefined && location !== null) {
            project.location = location;
        }

        await project.save();

        // Invalidate Cache
        const key1 = `user:${req.user.id}:role:project:id:${req.params.id}`;
        const key2 = `user:${req.user.id}:role:project`;

        redisClient.del(key1);
        redisClient.del(key2);

        res.status(200).json({
            message: "Project Updated Successfully",
            project: project.dataValues
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
        // Only Owner Can Delete Project
        const memberShip = await ProjectMember.findOne({
            where: {
                user_id: req.user.id,
                project_id: req.params.id,
                role : "owner"
            }
        });
        
        if(!memberShip) {
            return res.status(403).json({ message: "Only Owner Can Delete the Project" });
        }

        // console.log("Deleting...",req.params.id);

        // Delete Project from DB
        await Project.destroy({
            where: {
                id: req.params.id
            }
        });

        // console.log("Deleted");

        const key1 = `user:${req.user.id}:role:project:id:${req.params.id}`;
        const key2 = `user:${req.user.id}:role:project`;

        redisClient.del(key1);
        redisClient.del(key2);

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