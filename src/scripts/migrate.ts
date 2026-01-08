

import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../models/index';


export const migrator = new Umzug({
  migrations: {
    glob: 'migrations/*.ts',
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

/**
 * Executes all pending migrations.
 */
export const runMigrations = async () => {
  try {
    console.log('Starting migrations...');
    await migrator.up();
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

/**
 * Reverts the last migration.
 */
export const rollbackMigration = async () => {
  try {
    console.log('Rolling back last migration...');
    await migrator.down();
    console.log('Rollback completed successfully.');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
};
