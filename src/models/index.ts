
import sequelize from '../config/database.js';
import { Restaurant } from './Restaurant.js';
import { Table } from './Table.js';
import { Reservation } from './Reservation.js';

// Define Associations
Restaurant.hasMany(Table, { foreignKey: 'restaurantId', as: 'tables' });
Table.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Restaurant.hasMany(Reservation, { foreignKey: 'restaurantId', as: 'reservations' });
Reservation.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

Table.hasMany(Reservation, { foreignKey: 'tableId', as: 'reservations' });
Reservation.belongsTo(Table, { foreignKey: 'tableId', as: 'table' });

export {
  sequelize,
  Restaurant,
  Table,
  Reservation
};

/**
 * Initializes the database connection and synchronizes models.
 * In a production environment, migrations are preferred over sync().
 */
export const initDb = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models with the database
    // await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
