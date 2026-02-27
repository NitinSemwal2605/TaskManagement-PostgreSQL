import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Project from "./Project.js";
import User from "./User.js";

const ProjectMember = sequelize.define(
    "ProjectMember",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Project,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        role: {
            type: DataTypes.ENUM("owner", "admin", "member"),
            defaultValue: "member",
        },
    },
    {
        tableName: "projectmembers",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
        indexes: [
            { unique: true, fields: ["project_id", "user_id"],},
        ],
    }
);

export default ProjectMember;