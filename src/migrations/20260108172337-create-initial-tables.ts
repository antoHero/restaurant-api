
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    // 1. Create Restaurants Table
    await queryInterface.createTable('restaurants', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "slug",
        unique: true,
      },
      openingTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      closingTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalTables: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "total_tables",
        validate: {
          min: 1,
        },
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

    // 2. Create Tables Table
    await queryInterface.createTable('tables', {
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
      tableNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
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

    await queryInterface.createTable('reservations', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uniqueReference: {
        type: DataTypes.STRING,
        unique: true,
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'restaurants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'tables', key: 'id' },
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
      startDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      durationMinutes: {
        type: DataTypes.INTEGER,
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
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('reservations');
    await queryInterface.dropTable('tables');
    await queryInterface.dropTable('restaurants');
  },
};
