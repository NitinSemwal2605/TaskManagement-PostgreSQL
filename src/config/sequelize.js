import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config({ quiet: true });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectSequelize = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize connected successfully!");

    const result = await sequelize.query("SELECT NOW()");
    console.log("Database time:", result[0][0].now);

  } catch (error) {
    console.error("Sequelize connection error:", error);
    process.exit(1);
  }
};

export default sequelize;