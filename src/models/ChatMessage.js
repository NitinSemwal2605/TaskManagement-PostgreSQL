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
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Project,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        senderId: {
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
        underscored: false,
        createdAt: "createdAt",
        updatedAt: false,
        indexes: [
            { fields: ["projectId"],},
            { fields: ["createdAt"],},
        ],
    }
);

export default ChatMessage;