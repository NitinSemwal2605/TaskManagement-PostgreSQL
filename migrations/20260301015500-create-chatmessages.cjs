'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = await queryInterface.showAllTables();
    
    if (!tableExists.includes('chatmessages')) {
      await queryInterface.createTable('chatmessages', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        projectId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'projects',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        senderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    } else {
      // Table exists, check if updatedAt is missing
      const tableDefinition = await queryInterface.describeTable('chatmessages');
      if (!tableDefinition.updatedAt) {
        await queryInterface.addColumn('chatmessages', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
      }
    }

    // Defensive check for indices
    const [results] = await queryInterface.sequelize.query(
      "SELECT indexname FROM pg_indexes WHERE tablename = 'chatmessages';"
    );
    const indexNames = results.map(r => r.indexname);

    if (!indexNames.includes('chatmessages_project_id')) {
        try { await queryInterface.addIndex('chatmessages', ['projectId']); } catch (e) {}
    }
    if (!indexNames.includes('chatmessages_created_at')) {
        try { await queryInterface.addIndex('chatmessages', ['createdAt']); } catch (e) {}
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('chatmessages');
  }
};
