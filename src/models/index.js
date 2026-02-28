import ChatMessage from "./ChatMessage.js";
import Project from "./Project.js";
import ProjectMember from "./ProjectMember.js";
import Task from "./Task.js";
import User from "./User.js";
import Session from "./session.js";

User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: "userId",
});

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: "projectId",
});

Project.hasMany(ProjectMember, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
  as : "members",
});

ProjectMember.belongsTo(Project, {
  foreignKey: "projectId",
});

User.hasMany(ProjectMember, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

ProjectMember.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Project.hasMany(Task, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});

Task.belongsTo(Project, {
  foreignKey: "projectId",
});

Project.hasMany(ChatMessage, {
  foreignKey: "projectId",
  onDelete: "CASCADE",
});

ChatMessage.belongsTo(Project, {
  foreignKey: "projectId",
});

User.hasMany(ChatMessage, {
  foreignKey: "senderId",
  onDelete: "CASCADE",
});

ChatMessage.belongsTo(User, {
  foreignKey: "senderId",
});

export { ChatMessage, Project, ProjectMember, Session, Task, User };
