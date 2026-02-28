import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Task = sequelize.define("Task",
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
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "completed"),
            defaultValue: "pending",
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        tableName: "tasks",
        timestamps: true,
        underscored: false,
        createdAt: "createdAt",
        updatedAt: false,
    }
);

export default Task;