import ProjectMember from "../models/ProjectMember.js";

export const getMembership = async (userId, projectId) => {
    return await ProjectMember.findOne({
        where: {
            userId: userId,
            projectId: projectId
        }
    });
};