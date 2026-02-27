import ProjectMember from "../models/ProjectMember.js";

export const getMembership = async (userId, projectId) => {
    return await ProjectMember.findOne({
        where: {
            user_id: userId,
            project_id: projectId
        }
    });
};