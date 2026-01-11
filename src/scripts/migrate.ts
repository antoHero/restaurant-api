export {};

import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from '../models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migrator for Schema changes in the migrations/ folder
 */
export const migrator = new Umzug({
  migrations: {
    // Use absolute path to ensure files are found regardless of CWD
    glob: path.join(__dirname, '../migrations/*.ts').replace(/\\/g, '/'),
    resolve: ({ name, path: migrationPath, context }) => {
      if (!migrationPath) {
        throw new Error(`Migration path is undefined for migration: ${name}`);
      }
      return {
        name,
        path: migrationPath,
        up: async () => {
          const migration = await import(migrationPath);
          const migrationModule = migration.default || migration;
          return migrationModule.up(context);
        },
        down: async () => {
          const migration = await import(migrationPath);
          const migrationModule = migration.default || migration;
          return migrationModule.down(context);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'SequelizeMeta' }),
  logger: console,
});

export const runMigrations = async () => {
  try {
    console.log('--- Checking for Schema Migrations ---');
    const pending = await migrator.pending();
    if (pending.length === 0) {
      console.log('No pending migrations found.');
      return;
    }
    console.log(`Found ${pending.length} pending migrations. Running now...`);
    await migrator.up();
    console.log('--- Schema Migrations Completed ---');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// ESM equivalent of require.main === module
const isMain = import.meta.url === `file://${process.argv[1]}` || import.meta.url === `file://${path.resolve(process.argv[1])}`;

if (isMain || process.argv[1]?.endsWith('migrate.ts')) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
