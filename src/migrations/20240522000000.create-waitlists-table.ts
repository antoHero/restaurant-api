
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable('reservations');
    if (!tableInfo.status) {
      await queryInterface.addColumn('reservations', 'status', {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'confirmed',
      });
    }

    const tables = await queryInterface.showAllTables();
    if (!tables.includes('waitlists')) {
      await queryInterface.createTable('waitlists', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        restaurantId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'restaurants', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        customerName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        partySize: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        preferredDateTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('waitlists');
    await queryInterface.removeColumn('reservations', 'status');
  },
};
