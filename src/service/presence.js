import redisClient from "../config/redis.js";
import { ProjectMember } from "../models/index.js";

// Get All Project IDs for a User
const getUserProjectIds = async (userId) => {
  try {
    
    const memberships = await ProjectMember.findAll({
      where: { userId: userId },
      attributes: ["projectId"],
      raw: true, // Plain Object
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
  
  const promises = userIds.map(id => redisClient.get(`presence:user:${id}`));
  const results = await Promise.all(promises); // Array of Null/Online
  
  return userIds.filter((id, index) => results[index] === "online"); // Only Online
};


// Handling Presence
export const handlePresence = (socket, io) => {
  const userId = socket.user.id;

  const setupPresence = async () => {
    try {
      const key = `presence:user:${userId}`;
      await redisClient.set(key, "online", "EX", 24 * 60 * 60 * 7);
      console.log(`User ${userId} is now Online`);
      
      const previousPresence = await redisClient.get(key);
      if (previousPresence === "online") {
        console.log(`User ${userId} is already online`);
        return;
      }

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

  // fetching online members of project
  socket.on("get:project:presence", async (payload) => {
    try {
      const projectId  = payload.projectId
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
      console.log("hello");
      socket.emit("project:presence", { projectId, onlineMembers: onlineMemberIds }); // Send List Of Online Members.
      console.log("these members are online", onlineMemberIds);

    } catch (err) {
      console.error("Error fetching project presence:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const key = `presence:user:${userId}`;
      await redisClient.del(key); // Delete Presence
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
};
