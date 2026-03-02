import { ChatMessage, User } from "../models/index.js";

// Handle Chat Socket Connections
export const handleChat = (socket, io) => {
    socket.on("chat:send", async(data) =>{
        try{
            const { projectId, message } = data;
            const userId = socket.user.id;

            if (!projectId || !message) {
                return socket.emit("error", { message: "Project ID and message are required" });
            }

            // Save Message to DB
            const chatMessage = await ChatMessage.create({
                projectId,
                senderId: userId,
                message,
                createdAt: new Date(),
            });

            // Fetch Sender Info
            const sender = await User.findByPk(userId, {
                attributes: ["id", "username", "email"],
            });

            const messagePayload = {
                ...chatMessage.dataValues,
                sender,
            };

            // Broadcast to Project Room
            // console.log(messagePayload);
            io.to(`project:${projectId}`).emit("chat:received", messagePayload);
        }
        catch(err){
            console.error("Chat Error:", err);
            socket.emit("error", { message: "Failed to send message" });
        }
    })

    // Inside Project Broadcast to Everyone that user is typing.
    socket.on("chat:typing:start", (data) =>{
        const { projectId } = data;
        const userId = socket.user.id;
        
        if (!projectId) {
            return socket.emit("error", { message: "Project ID is required" });
        }
        
        socket.to(`project:${projectId}`).emit("chat:typing:start", {
            userId,
            message: `User ${userId} is typing...`
        });
    })

    // Typing Stopped
    socket.on("chat:typing:stop", (data) =>{
        const { projectId } = data;
        const userId = socket.user.id;
        
        if (!projectId) {
            return socket.emit("error", { message: "Project ID is required" });
        }
        
        socket.to(`project:${projectId}`).emit("chat:typing:stop", {
            userId,
            message: `User ${userId} has stopped typing.`
        });
    })
};