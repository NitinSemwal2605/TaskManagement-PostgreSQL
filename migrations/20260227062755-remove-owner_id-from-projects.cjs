'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the owner_id column from projects
    await queryInterface.removeColumn('projects', 'owner_id');
  },

  async down(queryInterface, Sequelize) {
    // Add owner_id back to projects in case of rollback
    await queryInterface.addColumn('projects', 'owner_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};