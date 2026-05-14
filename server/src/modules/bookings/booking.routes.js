const express = require('express');
const bookingController = require('./booking.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { createBookingSchema, updateBookingStatusSchema, rebookSchema } = require('./booking.validation');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Seeker routes
router.post('/', authorize('seeker'), validate(createBookingSchema), bookingController.createBooking);
router.get('/my-bookings', authorize('seeker'), bookingController.getSeekerBookings);
router.patch('/:id/cancel', authorize('seeker'), bookingController.cancelBooking);
router.post('/:id/rebook', authorize('seeker'), validate(rebookSchema), bookingController.rebookWorker);

// Provider routes
router.get('/provider', authorize('provider'), bookingController.getProviderBookings);
router.patch('/:id/status', authorize('provider'), validate(updateBookingStatusSchema), bookingController.updateBookingStatus);

// Shared route (both seeker and provider can view)
router.get('/:id', bookingController.getBookingById);

module.exports = router;
