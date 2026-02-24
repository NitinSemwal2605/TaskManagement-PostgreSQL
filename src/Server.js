import dotenv from "dotenv";
import process from "process";
import App from "./App.js";
import { connectRedis } from "./config/redis.js";
import sequelize, { connectSequelize } from "./config/sequelize.js";
dotenv.config({ quiet: true });
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Authenticated Successfully");

    await connectSequelize();
    console.log("Sequelize Connected");

    // await sequelize.sync({ alter: false });
    console.log("Sequelize Models Synced");

    await connectRedis();

    App.listen(PORT, () => {
      console.log(`Server running on: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Startup Error:", err);
    process.exit(1);
  }
}

startServer();