import redisClient from "../config/redis.js";
import { ProjectMember } from "../models/index.js";


// Get All Project IDs for a User
const getUserProjectIds = async (userId) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: userId },
      attributes: ["projectId"],
      raw: true,
    });
    return memberships.map((m) => m.projectId);
  } catch (error) {
    console.error("Error fetching user project IDs:", error);
    return [];
  }
};


// Get Online Users from List of User IDs
export const getOnlineUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) return [];
  
  // Redis v4+ uses direct array for multi/exec
  const promises = userIds.map(id => redisClient.get(`presence:user:${id}`));
  const results = await Promise.all(promises);
  
  return userIds.filter((id, index) => results[index] === "online");
};


// Handling Presence
export const handlePresence = (socket, io) => {
  const userId = socket.user.id;

  const setupPresence = async () => {
    try {
      await redisClient.set(`presence:user:${userId}`, "online", {
        EX: 120 // 2 minutes heartbeat
      });
      
      console.log(`User ${userId} is now Online`);
      
      // Get all projects this user is in
      const projectIds = await getUserProjectIds(userId);
      
      // Broadcast to All project rooms that user is online
      projectIds.forEach(projectId => {
        io.to(`project:${projectId}`).emit("user:online", { userId });
      });

    } catch (err) {
      console.error("Presence Error:", err);
    }
  };

  setupPresence();

  // Fetch Presence for a Project
  socket.on("get:project:presence", async (projectId) => {
    try {
      // Verify membership
      const membership = await ProjectMember.findOne({
        where: { projectId: projectId, userId: userId }
      });

      if (!membership) return;

      // Get all members of the project
      const members = await ProjectMember.findAll({
        where: { projectId: projectId },
        attributes: ["userId"]
      });

      const memberIds = members.map(m => m.userId);
      const onlineMemberIds = await getOnlineUsers(memberIds);

      socket.emit("project:presence", { projectId, onlineMembers: onlineMemberIds });
      console.log("these members are online", onlineMemberIds);
    } catch (err) {
      console.error("Error fetching project presence:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await redisClient.del(`presence:user:${userId}`);
      console.log(`User ${userId} disconnected`);

      const projectIds = await getUserProjectIds(userId);
      
      // Broadcast to All that user is offline
      projectIds.forEach(projectId => {
        io.to(`project:${projectId}`).emit("user:offline", { userId });
      });
      
      console.log(`User ${userId} is now Offline`);
    } catch (err) {
      console.error("Presence disconnection error:", err);
    }
  });

  socket.on("heartbeat", async () => {
    await redisClient.set(`presence:user:${userId}`, "online", {
      EX: 120
    });
    console.log(`User ${userId} heartbeat`);
  });
};
