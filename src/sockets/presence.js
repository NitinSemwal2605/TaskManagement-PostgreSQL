import redisClient from "../config/redis.js";
import ProjectMember from "../models/ProjectMember.js";

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

// check online status of multiple users from Redis
export const getOnlineUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) {
        return [];
    }

    const promises = userIds.map(userId => redisClient.get(`presence:user${userId}`));
    const results = await Promise.all(promises);

    return userIds.filter((id, index) => results[index] === 'online');
}

export const handlePresence = async (socket, io) => {
    const userId = socket.user.id;

    const setupPresence = async () => {
        try{
            // Set User Online in Redis
            redisClient.set(`presence:user${userId}`, 'online', 'EX', 120);

            console.log(`User ${userId} is now Online`);
        
            // Get all projects this user is in
            const projectIds = await getUserProjectIds(userId);

            // Brodcast Presence Update to all project rooms
            projectIds.forEach(projectId => {
                io.to(`project:${projectId}`).emit('presence:update', {
                    userId: userId,
                    status: 'online'
                });
            });
        }
        catch (err) {
            console.error('Error setting user presence:', err);
        }
    }

    setupPresence();

    socket.on('get:project:presence', async (projectId, callback) => {
        try{
            // Verify Membership
            const membership = await ProjectMember.findOne({
                where: { projectId , userId}
            });

            if(!membership){
                return callback({error: 'You are not a member of this project'});
            }

            // Get All Members of the Project
            const members = await ProjectMember.findAll({
                where: { projectId },
                attributes: ['userId']
            });

            const memberIds = members.map(m => m.userId);
            const onlineUserIds = await getOnlineUsers(memberIds);
            
            socket.emit('presence:project', {
                projectId: projectId,
                onlineUsers: onlineUserIds
            });
        }
        catch (err) {
            console.error('Error fetching project presence:', err);
        }
    });

    socket.on("disconnect", async () => {
        try {
            await redisClient.del(`presence:user:${userId}`);
            console.log(`User ${userId} disconnected`);

            const projectIds = await getUserProjectIds(userId);
            
            // Broadcast to All project rooms that user is offline
            projectIds.forEach(projectId => {
                io.to(`project:${projectId}`).emit("user:offline", { userId });
            });
        }
        catch (err) {
            console.error("Presence disconnection error:", err);
        }
    });

    socket.on('heartbeat', async () => {
        await redisClient.set(`presence:user:${userId}`, 'online', 'EX', 120);
        console.log(`Received heartbeat from user ${userId}, presence refreshed`);
    });
}