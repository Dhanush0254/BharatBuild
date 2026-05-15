const express = require('express');
const router = express.Router();
const transportCtrl = require('./transport.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// Public
router.get('/nearby-drivers', transportCtrl.getNearbyDrivers);
router.get('/estimate', transportCtrl.estimatePrice);

// Protected
router.use(authenticate);
router.post('/', transportCtrl.create);
router.get('/my', transportCtrl.getMyBookings);
router.get('/driver/bookings', authorize('provider'), transportCtrl.getDriverBookings);
router.get('/:id', transportCtrl.getById);
router.patch('/:id/assign', authorize('provider', 'admin'), transportCtrl.assignDriver);
router.patch('/:id/status', transportCtrl.updateStatus);

module.exports = router;
