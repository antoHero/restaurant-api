import * as express from 'express';
import { validate } from '../middleware/validate.js';
import * as ReservationController from '../controllers/reservation.controller.js';
import { 
    createReservationSchema, 
    checkAvailabilitySchema, 
    getAvailableSlotsSchema, 
    getReservationsByDateSchema, 
    getReservationsByReferenceSchema, 
    cancelReservationSchema,
    modifyReservationSchema
} from '../schemas/reservation.schema.js';

const router = express.Router();

// #swagger.tags = ['Reservation']
router.post('/reservations', validate(createReservationSchema), ReservationController.createReservation);
router.get('/reservations/check', validate(checkAvailabilitySchema), ReservationController.checkAvailability);
router.get('/reservations/slots', validate(getAvailableSlotsSchema), ReservationController.getAvailableSlots);
router.get('/reservations/:slug', validate(getReservationsByReferenceSchema), ReservationController.getReservationsByUniqueReference);
router.patch('/reservations/:reference/cancel', validate(cancelReservationSchema), ReservationController.cancelReservation);
router.put('/reservations/:reference', validate(modifyReservationSchema), ReservationController.modifyReservation);
router.get('/reservations/:slug/:date', validate(getReservationsByDateSchema), ReservationController.getReservationsByDate);


export default router;