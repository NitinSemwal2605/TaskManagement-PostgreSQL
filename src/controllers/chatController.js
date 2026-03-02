import { ChatMessage, User } from "../models/index.js";
import { getMembership } from "../utils/projectAccess.js";

// Fetch Chat Messages for a Project
export const getMessages = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    try{
        // Membership Check
        const membership = await getMembership(userId, projectId);
        if(!membership) {
            return res.status(403).json({ message: "Access Denied" });
        }

        // Fetch Messages with Pagination
        const {count , rows} = await ChatMessage.findAndCountAll({
            where: { projectId },
            include: [
                {
                    model: User,
                    attributes: ["id", "username"]
                }
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset
        });

        res.status(200).json({
            message: "Messages fetched successfully",
            messages: rows.reverse(),
            total: count,
            page,
            limit,
        });
    } catch (err) {
        console.error("Error fetching chat messages:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}