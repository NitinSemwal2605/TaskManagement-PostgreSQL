import ChatMessage from "./ChatMessage.js";
import Project from "./Project.js";
import ProjectMember from "./ProjectMember.js";
import Task from "./Task.js";
import User from "./User.js";
import Session from "./session.js";

User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: "user_id",
});

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: "project_id",
});

Project.hasMany(ProjectMember, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
  as : "members",
});

ProjectMember.belongsTo(Project, {
  foreignKey: "project_id",
});

User.hasMany(ProjectMember, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
});

ProjectMember.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Project.hasMany(Task, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
});

Task.belongsTo(Project, {
  foreignKey: "project_id",
});

Project.hasMany(ChatMessage, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
});

ChatMessage.belongsTo(Project, {
  foreignKey: "project_id",
});

User.hasMany(ChatMessage, {
  foreignKey: "sender_id",
  onDelete: "CASCADE",
});

ChatMessage.belongsTo(User, {
  foreignKey: "sender_id",
});

export { ChatMessage, Project, ProjectMember, Session, Task, User };
