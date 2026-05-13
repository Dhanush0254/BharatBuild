const express = require('express');
const listingController = require('./listing.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const upload = require('../../middleware/upload');
const { createListingSchema, updateListingSchema, searchQuerySchema } = require('./listing.validation');

const router = express.Router();

// Public routes
router.get('/search', validate(searchQuerySchema, 'query'), listingController.searchListings);
router.get('/featured', listingController.getFeaturedListings);
router.get('/stats', listingController.getMarketplaceStats);

// Provider routes (protected)
router.get('/my-listings', authenticate, authorize('provider'), listingController.getMyListings);

router.post(
  '/',
  authenticate,
  authorize('provider'),
  validate(createListingSchema),
  listingController.createListing
);

router.put(
  '/:id',
  authenticate,
  authorize('provider'),
  validate(updateListingSchema),
  listingController.updateListing
);

router.delete(
  '/:id',
  authenticate,
  authorize('provider', 'admin'),
  listingController.deleteListing
);

router.post(
  '/:id/images',
  authenticate,
  authorize('provider'),
  upload.array('images', 5),
  listingController.uploadListingImages
);

// Public route (must be last — dynamic param)
router.get('/:id', listingController.getListing);

module.exports = router;
