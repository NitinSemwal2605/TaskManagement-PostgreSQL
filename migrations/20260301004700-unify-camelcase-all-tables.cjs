'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tasksTable = await queryInterface.describeTable('tasks');
    const usersTable = await queryInterface.describeTable('users');
    const projectsTable = await queryInterface.describeTable('projects');

    // 1. Tasks Table: project_id -> projectId
    if (tasksTable.project_id && !tasksTable.projectId) {
      await queryInterface.renameColumn('tasks', 'project_id', 'projectId');
    }
    
    // 2. Unify createdAt across existing tables
    // Users: created_at -> createdAt
    if (usersTable.created_at && !usersTable.createdAt) {
      await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    }

    // Projects: created_at -> createdAt
    if (projectsTable.created_at && !projectsTable.createdAt) {
      await queryInterface.renameColumn('projects', 'created_at', 'createdAt');
    }

    // Tasks: created_at -> createdAt
    if (tasksTable.created_at && !tasksTable.createdAt) {
      await queryInterface.renameColumn('tasks', 'created_at', 'createdAt');
    }

    // Note: ProjectMembers was already handled in the previous migration
    // ChatMessages table doesn't exist yet, it will be created in a new migration
  },

  async down (queryInterface, Sequelize) {
    const tasksTable = await queryInterface.describeTable('tasks');
    const usersTable = await queryInterface.describeTable('users');
    const projectsTable = await queryInterface.describeTable('projects');

    // 1. Tasks Table: projectId -> project_id
    if (tasksTable.projectId && !tasksTable.project_id) {
      await queryInterface.renameColumn('tasks', 'projectId', 'project_id');
    }
    
    // 2. Revert createdAt
    if (usersTable.createdAt && !usersTable.created_at) {
      await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    }

    if (projectsTable.createdAt && !projectsTable.created_at) {
      await queryInterface.renameColumn('projects', 'createdAt', 'created_at');
    }

    if (tasksTable.createdAt && !tasksTable.created_at) {
      await queryInterface.renameColumn('tasks', 'createdAt', 'created_at');
    }
  }
};
