import * as express from "express";
import { Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import {
  addTableSchema,
  createRestaurantSchema,
  getAvailableTablesSchema,
  getRestaurantSchema,
  getRestaurantsSchema,
} from "../schemas/restaurant.schema.js";
import * as RestaurantController from "../controllers/restaurant.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Restaurant management
 */

router.post("/", validate(createRestaurantSchema), (req, res) => {
  // #swagger.tags = ['Restaurant']
  // #swagger.summary = 'Create a new restaurant'
  // #swagger.description = 'Initializes a restaurant profile with operating hours.'
  /* #swagger.parameters['body'] = {
            in: 'body',
            schema: { $ref: '#/definitions/Restaurant' }
      } */
  RestaurantController.createRestaurant(req, res);
});

router.post("/:slug/tables", validate(addTableSchema), (req, res) => {
  // #swagger.tags = ['Restaurant']
  // #swagger.summary = 'Add a table to a restaurant'
  RestaurantController.addTable(req, res);
});

router.get("/", validate(getRestaurantsSchema), (req, res) => {
  // #swagger.tags = ['Restaurant']
  // #swagger.summary = 'Get all restaurants'
  RestaurantController.getRestaurants(req, res);
});

router.get("/:slug", validate(getRestaurantSchema), (req, res) => {
  // #swagger.tags = ['Restaurant']
  // #swagger.summary = 'Get restaurant by slug'
  RestaurantController.getRestaurant(req, res);
});

router.get(
  "/:slug/available-tables",
  validate(getAvailableTablesSchema),
  (req, res) => {
    // #swagger.tags = ['Restaurant']
    // #swagger.summary = 'Get available tables for a restaurant'
    RestaurantController.getAvailableTables(req, res);
  }
);

export default router;
