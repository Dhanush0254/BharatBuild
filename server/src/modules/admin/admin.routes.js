const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Listings moderation
router.get('/listings', adminController.getAllListings);
router.get('/listings/pending', adminController.getPendingListings);
router.patch('/listings/:id/moderate', adminController.moderateListing);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

module.exports = router;
