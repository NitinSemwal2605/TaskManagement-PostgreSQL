import { Server } from "socket.io";
import { handlePresence } from "./presence.js";
import { handleProjectRooms } from "./projectRooms.js";
import {socketAuthMiddleware}  from "../middlewares/socketAuth.middleware.js";

let io;

export const initSocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    console.log("Socket.IO: Server instance created and attached to HTTP server.");

    io.use(socketAuthMiddleware); // Authentication middleware

    io.on("connection", (socket) => {
      console.log(`Socket Connected: ${socket.id} (User: ${socket.user?.id || 'Unknown'})`);

      handleProjectRooms(socket); // Handle project rooms
      handlePresence(socket, io); // Handle presence

      socket.on("disconnect", (reason) => {
        console.log(`Socket Disconnected: ${socket.id} (Reason: ${reason})`);
      });
    });

    return io;
  } catch (error) {
    console.error("Socket.IO Initialization Error:", error);
    throw error;
  }
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};
