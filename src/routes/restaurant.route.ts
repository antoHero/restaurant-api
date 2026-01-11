import * as express from 'express';
import { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import { addTableSchema, createRestaurantSchema, getAvailableTablesSchema, getRestaurantSchema, getRestaurantsSchema } from '../schemas/restaurant.schema.js';
import * as RestaurantController from '../controllers/restaurant.controller.js';

const router = express.Router();

router.post('/restaurants', validate(createRestaurantSchema), RestaurantController.createRestaurant);
router.post('/restaurants/:slug/tables', validate(addTableSchema), RestaurantController.addTable);
router.get('/restaurants', validate(getRestaurantsSchema), RestaurantController.getRestaurants);
router.get('/restaurants/:slug', validate(getRestaurantSchema), RestaurantController.getRestaurant);
router.get('/restaurants/:slug/available-tables', validate(getAvailableTablesSchema), RestaurantController.getAvailableTables);

export default router;
