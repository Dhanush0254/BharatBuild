const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/pending', adminController.getPendingListings);
router.patch('/listings/:id/moderate', adminController.moderateListing);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);

// V2: Verification
router.get('/verifications', adminController.getVerificationRequests);
router.patch('/verify/:id', adminController.handleVerification);

module.exports = router;
