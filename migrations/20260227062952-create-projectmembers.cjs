'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projectmembers', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'projects', // table name must match projects table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // table name must match users table
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'member'),
        allowNull: false,
        defaultValue: 'member'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // Add unique index on project_id + user_id
    await queryInterface.addIndex('projectmembers', ['project_id', 'user_id'], {
      unique: true
    });
  },

  async down(queryInterface) {
    // Remove the unique index first
    await queryInterface.removeIndex('projectmembers', ['project_id', 'user_id']);
    // Drop the table
    await queryInterface.dropTable('projectmembers');
  }
};