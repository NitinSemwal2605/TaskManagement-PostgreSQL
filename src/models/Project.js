import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Project = sequelize.define("Project",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        location:{
            type: DataTypes.JSONB,
            allowNull: true,
        }
    },
    {
        tableName: "projects",
        timestamps: true,
        underscored: false,
        createdAt: "createdAt",
        updatedAt: false,
    }
);

export default Project;