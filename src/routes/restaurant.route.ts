import * as express from 'express';
import { Request, Response } from "express";

const router = express.Router();

router.get('restaurants', async (req: Request, res: Response) => {
    res.status(200).json({ message: 'Working' });
});

export default router;

