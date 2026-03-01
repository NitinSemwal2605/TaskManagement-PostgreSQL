'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tasksTable = await queryInterface.describeTable('tasks');
    const usersTable = await queryInterface.describeTable('users');
    const projectsTable = await queryInterface.describeTable('projects');
    const membersTable = await queryInterface.describeTable('projectmembers');

    // 1. Tasks Table: project_id -> projectId, created_at -> createdAt
    if (tasksTable.project_id && !tasksTable.projectId) {
      await queryInterface.renameColumn('tasks', 'project_id', 'projectId');
    }
    if (tasksTable.created_at && !tasksTable.createdAt) {
      await queryInterface.renameColumn('tasks', 'created_at', 'createdAt');
    }
    
    // 2. Users Table: created_at -> createdAt
    if (usersTable.created_at && !usersTable.createdAt) {
      await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    }

    // 3. Projects Table: created_at -> createdAt
    if (projectsTable.created_at && !projectsTable.createdAt) {
      await queryInterface.renameColumn('projects', 'created_at', 'createdAt');
    }

    // 4. ProjectMembers Table: project_id -> projectId, user_id -> userId, created_at -> createdAt
    if (membersTable.project_id && !membersTable.projectId) {
      await queryInterface.renameColumn('projectmembers', 'project_id', 'projectId');
    }
    if (membersTable.user_id && !membersTable.userId) {
      await queryInterface.renameColumn('projectmembers', 'user_id', 'userId');
    }
    if (membersTable.created_at && !membersTable.createdAt) {
      await queryInterface.renameColumn('projectmembers', 'created_at', 'createdAt');
    }

    // Note: Sessions table already uses camelCase (createdAt, updatedAt, userId)
  },

  async down (queryInterface, Sequelize) {
    // Revert changes if needed
    try { await queryInterface.renameColumn('tasks', 'projectId', 'project_id'); } catch(e) {}
    try { await queryInterface.renameColumn('tasks', 'createdAt', 'created_at'); } catch(e) {}
    try { await queryInterface.renameColumn('users', 'createdAt', 'created_at'); } catch(e) {}
    try { await queryInterface.renameColumn('projects', 'createdAt', 'created_at'); } catch(e) {}
    try { await queryInterface.renameColumn('projectmembers', 'projectId', 'project_id'); } catch(e) {}
    try { await queryInterface.renameColumn('projectmembers', 'userId', 'user_id'); } catch(e) {}
    try { await queryInterface.renameColumn('projectmembers', 'createdAt', 'created_at'); } catch(e) {}
  }
};
