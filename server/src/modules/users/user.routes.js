const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Saved workers (seeker)
router.post('/save-worker/:id', authorize('seeker'), userController.saveWorker);
router.delete('/save-worker/:id', authorize('seeker'), userController.unsaveWorker);
router.get('/saved-workers', authorize('seeker'), userController.getSavedWorkers);

// Recently viewed (seeker)
router.get('/recently-viewed', authorize('seeker'), userController.getRecentlyViewed);

// Verification (provider)
router.post('/verify-request', authorize('provider'), userController.submitVerification);

module.exports = router;
