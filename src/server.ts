import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { initDb } from "./models/index";
import { runMigrations } from "./scripts/migrate";
import { restaurantRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json() as any);

/**
 * REST API Routes
 */

// Restaurant Management
app.use('/api', restaurantRoutes);

/**
 * Global Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

/**
 * Bootstrap Server
 */
const startServer = async () => {
  try {
    // 1. Initialize Database
    await initDb();

    // 2. Run Migrations (Schema + Seeds)
    await runMigrations();

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log("Restaurant API Server Ready");
      console.log(`Listening on port ${PORT}`);
      console.log("Migrations: Applied via Umzug");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();

export default app;
