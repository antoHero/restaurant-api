import * as express from 'express';
import { Request, Response } from 'express';
import { validate } from '../middleware/validate';
import { addTableSchema, createRestaurantSchema, getRestaurantSchema, getRestaurantsSchema } from '../schemas/restaurant.schema';
import * as RestaurantController from '../controllers/restaurant.controller';

const router = express.Router();

// #swagger.tags = ['Restaurant']
router.post('/restaurants', validate(createRestaurantSchema), RestaurantController.createRestaurant);

router.post('/restaurants/:slug/tables', validate(addTableSchema), RestaurantController.addTable);

router.get('/restaurants', validate(getRestaurantsSchema), RestaurantController.getRestaurants);

router.get('/restaurants/:slug', validate(getRestaurantSchema), RestaurantController.getRestaurant);

export default router;
