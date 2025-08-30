'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'Admin'   },
      { id: 2, name: 'Manager' },
      { id: 3, name: 'Staff'   }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', {
      id: { [Sequelize.Op.in]: [1, 2, 3] }
    }, {});
  }
};
