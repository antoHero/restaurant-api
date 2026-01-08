import * as express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.post("/restaurants", async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  res.status(501).json({ message: "Create restaurant logic pending" });
});

router.post("/api/restaurants/:id/tables", async (req: Request, res: any) => {
  // #swagger.tags = ['Restaurant']
  res.status(501).json({ message: "Add tables logic pending" });
});

router.get("/restaurants", async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  res.status(200).json({ message: "Working", data: [] });
});

router.get("/api/restaurants/:id", async (req: Request, res: any) => {
  // #swagger.tags = ['Restaurant']
  res.status(501).json({ message: "Get restaurant logic pending" });
});

export default router;
