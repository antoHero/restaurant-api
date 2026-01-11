import * as express from "express";
import { validate } from "../middleware/validate.js";
import * as ReservationController from "../controllers/reservation.controller.js";
import {
  createReservationSchema,
  checkAvailabilitySchema,
  getAvailableSlotsSchema,
  getReservationsByDateSchema,
  getReservationsByReferenceSchema,
  cancelReservationSchema,
  modifyReservationSchema,
  joinWaitlistSchema,
} from "../schemas/reservation.schema.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservation
 *   description: Booking system
 */

router.post("/", validate(createReservationSchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Create a reservation'
  /* #swagger.parameters['body'] = {
            in: 'body',
            schema: { $ref: '#/definitions/Reservation' }
      } */
  ReservationController.createReservation(req, res);
});

router.get("/check", validate(checkAvailabilitySchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Check table availability'
  ReservationController.checkAvailability(req, res);
});

router.get("/slots", validate(getAvailableSlotsSchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Get available time slots'
  ReservationController.getAvailableSlots(req, res);
});

router.post("/waitlist", validate(joinWaitlistSchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Join the waitlist'
  ReservationController.joinWaitlist(req, res);
});

router.get("/:slug", validate(getReservationsByReferenceSchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Get reservation by reference'
  ReservationController.getReservationsByUniqueReference(req, res);
});

router.patch(
  "/:reference/cancel",
  validate(cancelReservationSchema),
  (req, res) => {
    // #swagger.tags = ['Reservation']
    // #swagger.summary = 'Cancel a reservation'
    ReservationController.cancelReservation(req, res);
  }
);

router.put("/:reference", validate(modifyReservationSchema), (req, res) => {
  // #swagger.tags = ['Reservation']
  // #swagger.summary = 'Modify a reservation'
  ReservationController.modifyReservation(req, res);
});

router.get(
  "/:slug/:date",
  validate(getReservationsByDateSchema),
  (req, res) => {
    // #swagger.tags = ['Reservation']
    // #swagger.summary = 'Get all reservations for a specific date'
    ReservationController.getReservationsByDate(req, res);
  }
);

export default router;
