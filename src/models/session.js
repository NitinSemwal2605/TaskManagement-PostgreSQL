import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";

const Session = sequelize.define("Session",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        refreshTokenHash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("Online", "Offline", "Revoked"),
            defaultValue: "Online"
        },
        ipAddress: {
            type: DataTypes.STRING
        },
        expiresAt: {
            type: DataTypes.DATE
        }
    },

    {
        tableName: "sessions",
        timestamps: true
    }
);

User.hasMany(Session, { foreignKey: "userId", onDelete: "CASCADE" });
Session.belongsTo(User, { foreignKey: "userId" , onDelete: "CASCADE"});

export default Session;