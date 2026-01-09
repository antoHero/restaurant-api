import * as express from 'express';
import { Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { createRestaurantSchema, getRestaurantSchema, getRestaurantsSchema } from '../schemas/restaurant.schema';
import * as RestaurantController from '../controllers/restaurant.controller';

const router = express.Router();

// #swagger.tags = ['Restaurant']
router.post('/restaurants', validate(createRestaurantSchema), RestaurantController.createRestaurant);

router.post('/api/restaurants/:slug/tables', async (req: Request, res: Response) => {
  // #swagger.tags = ['Restaurant']
  res.status(501).json({ message: 'Create restaurant logic pending' });
});

router.get('/restaurants', validate(getRestaurantsSchema), RestaurantController.getRestaurants);

router.get('/restaurants/:slug', validate(getRestaurantSchema), RestaurantController.getRestaurant);

export default router;
