'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('users', 'refreshtoken');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'refreshtoken', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};