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
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        tableName: "Projects",
        timestamps: false,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export default Project;