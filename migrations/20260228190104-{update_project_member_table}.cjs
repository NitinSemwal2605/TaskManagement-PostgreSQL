'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('projectmembers');

    // Rename project_id to projectId
    if (tableInfo.project_id && !tableInfo.projectId) {
      await queryInterface.renameColumn('projectmembers', 'project_id', 'projectId');
    }
    
    // Rename user_id to userId
    if (tableInfo.user_id && !tableInfo.userId) {
      await queryInterface.renameColumn('projectmembers', 'user_id', 'userId');
    }
    
    // Rename created_at to createdAt
    if (tableInfo.created_at && !tableInfo.createdAt) {
      await queryInterface.renameColumn('projectmembers', 'created_at', 'createdAt');
    }
  },

  async down (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('projectmembers');

    // Revert changes
    if (tableInfo.projectId && !tableInfo.project_id) {
      await queryInterface.renameColumn('projectmembers', 'projectId', 'project_id');
    }
    if (tableInfo.userId && !tableInfo.user_id) {
      await queryInterface.renameColumn('projectmembers', 'userId', 'user_id');
    }
    if (tableInfo.createdAt && !tableInfo.created_at) {
      await queryInterface.renameColumn('projectmembers', 'createdAt', 'created_at');
    }
  }
};
