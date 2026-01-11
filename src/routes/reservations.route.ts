import * as express from 'express';
import { Request, Response } from 'express';
import { validate } from '../middleware/validate.js';
import * as ReservationController from '../controllers/reservation.controller.js';
import { createReservationSchema, checkAvailabilitySchema, getAvailableSlotsSchema, getReservationsByDateSchema, getReservationsByReferenceSchema } from '../schemas/reservation.schema.js';

const router = express.Router();

router.post('/reservations', validate(createReservationSchema), ReservationController.createReservation);
router.get('/reservations/:reference', validate(getReservationsByReferenceSchema), ReservationController.getReservationsByUniqueReference);
router.get('/reservations/:data', validate(getReservationsByDateSchema), ReservationController.getReservationsByDate);
router.get('/reservations/availability', validate(checkAvailabilitySchema), ReservationController.checkAvailability);
router.get('/reservations/slots', validate(getAvailableSlotsSchema), ReservationController.getAvailableSlots);
router.get('/restaurants/:slug/reservations/:date', validate(getReservationsByDateSchema), ReservationController.getReservationsByDate);

export default router;