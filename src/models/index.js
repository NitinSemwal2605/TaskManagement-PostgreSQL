import User from "./User.js";
import Project from "./Project.js";
import Task from "./Task.js";

// User → Projects
User.hasMany(Project, {
  foreignKey: "owner_id",
  onDelete: "CASCADE",
});

Project.belongsTo(User, {
  foreignKey: "owner_id",
});

// Project → Tasks
Project.hasMany(Task, {
  foreignKey: "project_id",
  onDelete: "CASCADE",
});

Task.belongsTo(Project, {
  foreignKey: "project_id",
});

export { User, Project, Task };