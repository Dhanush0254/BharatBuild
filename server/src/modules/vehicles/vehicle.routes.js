const express = require('express');
const router = express.Router();
const vehicleCtrl = require('./vehicle.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// Public
router.get('/search', vehicleCtrl.searchNearby);
router.get('/:id', vehicleCtrl.getById);

// Protected
router.use(authenticate);
router.post('/', authorize('provider'), vehicleCtrl.register);
router.get('/my/vehicles', authorize('provider'), vehicleCtrl.getMyVehicles);
router.patch('/:id', authorize('provider', 'admin'), vehicleCtrl.update);
router.patch('/:id/toggle', authorize('provider'), vehicleCtrl.toggleAvailability);
router.delete('/:id', authorize('provider', 'admin'), vehicleCtrl.remove);

module.exports = router;
