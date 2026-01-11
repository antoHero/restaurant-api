import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { initDb } from './models/index.js';
import { runMigrations } from './scripts/migrate.js';
import swaggerUi from 'swagger-ui-express';
import { restaurantRoutes, reservationRoutes } from './routes/index.js';
import swaggerFile from './swagger-output.json' with { type: 'json' };

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json() as any);

/**
 * REST API Routes
 */
// Restaurant Management
app.use('/api', restaurantRoutes);
app.use('/api', reservationRoutes);

/**
 * Global Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
/**
 * Bootstrap Server
 */
const startServer = async () => {
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
        return;
    }
    try {
        await initDb();
        await runMigrations();

        
        app.listen(PORT, () => {
            console.log('Restaurant API Server Ready');
            console.log(`Listening on port ${PORT}`);
            console.log('Migrations: Applied via Umzug');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

if (process.env.NODE_ENV !== 'test' && !process.env.JEST_WORKER_ID) {
    startServer();
}

export default app;
