import dotenv from "dotenv";
import http from "http";
import process from "process";
import App from "./App.js";
import { connectRedis } from "./config/redis.js";
import sequelize, { connectSequelize } from "./config/sequelize.js";
import { createRateLimiter } from "./middlewares/ratelimiter.middleware.js";
import './models/index.js';
import { initSocket } from "./sockets/socketServer.js";

dotenv.config({ quiet: true });
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {

    await sequelize.authenticate();
    console.log("PostgreSQL Authenticated Successfully");
    
    await connectSequelize();
    console.log("Sequelize Connected");
    console.log("Sequelize Models Synced");

    await connectRedis();

    // Initial Middleware (Rate limiter should be before routes in App.js ideally)
    const rateLimiter = createRateLimiter();
    App.use(rateLimiter);

    // Create HTTP Server
    const server = http.createServer(App);

    // Initialize Socket.IO
    console.log("Initializing Socket.IO...");
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`SERVER STARTED`);
      console.log(`HTTP: http://localhost:${PORT}`);
      console.log(`Socket.IO: http://localhost:${PORT}/socket.io/`);
    });

  } catch (err) {
    console.error("Startup Error:", err);
    process.exit(1);
  }
}

startServer();