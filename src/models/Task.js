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
        status:{
            type: DataTypes.ENUM("pending", "in_progress", "completed"),
            defaultValue: "pending",
        },
        project_id: {
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
        tableName: "Tasks",
        timestamps: false,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export default Task;