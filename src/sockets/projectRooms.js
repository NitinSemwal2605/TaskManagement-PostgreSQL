import ProjectMember from "../models/ProjectMember.js";

// Middleware for Handling Project Rooms
export const handleProjectRooms = (socket) => {
    socket.on('join:Project', async (projectId) => {
        try{
            if(!projectId){
                return socket.emit('error', {message: 'Project ID is required to join a room'});
            }

            // Check Membership
            const membership = await ProjectMember.findOne({
                where: {
                    projectId: projectId,
                    userId: socket.user.id,
                },
            });

            if(!membership){
                return socket.emit('error', {
                    message: 'You are not a member of this project'
                });
            }

            const roomName = `project:${projectId}`;
            socket.join(roomName); // User Joins Project Room
            console.log(`User ${socket.user.id} joined room: ${roomName}`);

            // Successfull Joined
            socket.emit('joined:Project', {projectId: projectId,
                message: `Joined project room ${roomName}`
            });

            //Notify Others in the Room
            socket.to(roomName).emit('userJoined:Project', {
                userId: socket.user.id,
                message: `User ${socket.user.id} has joined the project`
            });
            
        } catch (err) {
            console.error('Error joining project room:', err);
            socket.emit('error', {message: 'Error joining project room'});
        }
    });

    socket.on('leave:Project', async (projectId) => {
        try{
            const roomName = `project:${projectId}`;
            socket.leave(roomName); // User Leaves Project Room
            console.log(`User ${socket.user.id} left room: ${roomName}`);

            // Successfull Left
            socket.emit('left:Project', {projectId: projectId,
                message: `Left project room ${roomName}`
            });

            //Notify Others in the Room
            socket.to(roomName).emit('userLeft:Project', {
                userId: socket.user.id,
                message: `User ${socket.user.id} has left the project`
            });
            
        } catch (err) {
            console.error('Error leaving project room:', err);
            socket.emit('error', {message: 'Error leaving project room'});
        }
    });
}

