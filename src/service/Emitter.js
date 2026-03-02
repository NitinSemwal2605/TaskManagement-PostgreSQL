import { getIO } from "./socketServer.js";

// Emit Event to User's Room (to Specific User)
export const emitToUser = (userId, event, data) => {
    try {
        const io = getIO();
        io.to(`user:${userId}`).emit(event, data);
    } catch (error) {
        console.error(`Error emitting to user ${userId}:`, error.message);
    }
};


// To remove the User from Project Room
export const forceRemoval = (userId,projectId) =>{
    try{
        const io = getIO();
        const userRoom = `user:${userId}`;
        const projectRoom = `project:${projectId}`;

        // Notify User
        io.to(userRoom).emit("project:kicked", { projectId, message: "You have been removed from this project" });
        
        // Notify others in the project room (to update their presence lists)
        io.to(projectRoom).emit("userLeft:Project", {
            userId,
            message: `User ${userId} has been removed from the project`
        });

        // Remove User from Room
        io.in(userRoom).socketsLeave(projectRoom);
        console.log(`Kicked user ${userId} from project room ${projectRoom}`);

    } catch(error){
        console.log("Error Occured while Force Removal :"+ error);
    }
}

// To remove All Users from Project Room (When Project is Deleted)
export const forceRemovalAllMembers = (projectId) =>{
    try{
        const io = getIO();
        const projectRoom = `project:${projectId}`;

        // Notify All Project Members
        io.to(projectRoom).emit("project:deleted", { projectId, message: "Project has been deleted" });

        // Remove Everyone from that Room
        io.in(projectRoom).socketsLeave(projectRoom);
        console.log(`Cleared all sockets from project room ${projectRoom}`);

    } catch(error){
        console.log("Error Occured while Force Removal All Members :"+ error);
    }
}


// Emit Event to Project Room (All Users)
export const emitToProject = (projectId, event, data) => {
    try {
        const io = getIO();
        io.to(`project:${projectId}`).emit(event, data);
    } catch (error) {
        console.error(`Error emitting to project ${projectId}:`, error.message);
    }
};


