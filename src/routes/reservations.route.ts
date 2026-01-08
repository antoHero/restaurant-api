import * as express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/reservations', async (req: Request, res: any) => {
  // #swagger.tags = ['Reservation']
  res.status(501).json({ message: 'Create reservation logic pending' });
});

router.get('/reservations/availability', async (req: Request, res: any) => {
  // #swagger.tags = ['Reservation']
  res.status(501).json({ message: 'Availability check pending' });
});


export default router;