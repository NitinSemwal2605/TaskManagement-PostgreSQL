import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Project from "./Project.js";
import User from "./User.js";

const ChatMessage = sequelize.define(
    "ChatMessage",
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
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "chatmessages",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
        indexes: [
            { fields: ["project_id"],},
            { fields: ["created_at"],},
        ],
    }
);

export default ChatMessage;