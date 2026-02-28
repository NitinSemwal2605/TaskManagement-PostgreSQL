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
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Project,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        userId: {
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
        underscored: false, // Switching to default camelCase
        createdAt: "createdAt",
        updatedAt: false,
        indexes: [
            { unique: true, fields: ["projectId", "userId"],},
        ],
    }
);

export default ProjectMember;