import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuth.middleware.js";
import { handleChat } from "./chatHandler.js";
import { handlePresence } from "./presence.js";
import { handleProjectRooms } from "./projectRooms.js";

let io;

export const initSocket = (server) => {
  try {
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    console.log("Socket.IO: Server instance created");

    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
      console.log(`Socket Connected: ${socket.id} (User: ${socket.user?.id || 'Unknown'})`);

      if(socket.user?.id){
        socket.join(`user:${socket.user.id}`);
        console.log("socket.user.id is :" + socket.user.id);
        console.log(`User ${socket.user.id} joined room: user:${socket.user.id}`);
      }

      handleProjectRooms(socket); // Handle project rooms
      handlePresence(socket, io); // Handle presence
      handleChat(socket, io); // Handle chat

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
