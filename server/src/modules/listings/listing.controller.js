const listingService = require('./listing.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Search and filter listings (geospatial)
 * @route   GET /api/v1/listings/search
 * @access  Public
 */
const searchListings = catchAsync(async (req, res) => {
  const result = await listingService.searchListings(req.query);
  sendResponse(res, 200, result, 'Listings retrieved successfully');
});

/**
 * @desc    Get listing details by ID
 * @route   GET /api/v1/listings/:id
 * @access  Public
 */
const getListing = catchAsync(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id);

  // Increment view count (fire and forget)
  listing.viewCount += 1;
  listing.save().catch((err) => console.error('Error updating view count', err));

  sendResponse(res, 200, listing, 'Listing details retrieved');
});

/**
 * @desc    Create a new listing
 * @route   POST /api/v1/listings
 * @access  Private (provider)
 */
const createListing = catchAsync(async (req, res) => {
  const listing = await listingService.createListing(req.body, req.user._id);
  sendResponse(res, 201, listing, 'Listing created — pending admin approval');
});

/**
 * @desc    Update a listing
 * @route   PUT /api/v1/listings/:id
 * @access  Private (provider — own listings only)
 */
const updateListing = catchAsync(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.body, req.user._id);
  sendResponse(res, 200, listing, 'Listing updated — pending re-approval');
});

/**
 * @desc    Delete a listing
 * @route   DELETE /api/v1/listings/:id
 * @access  Private (provider or admin)
 */
const deleteListing = catchAsync(async (req, res) => {
  const result = await listingService.deleteListing(req.params.id, req.user._id, req.user.role);
  sendResponse(res, 200, result, 'Listing deleted successfully');
});

/**
 * @desc    Get current provider's listings
 * @route   GET /api/v1/listings/my-listings
 * @access  Private (provider)
 */
const getMyListings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await listingService.getProviderListings(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Your listings retrieved');
});

/**
 * @desc    Get featured listings for landing page
 * @route   GET /api/v1/listings/featured
 * @access  Public
 */
const getFeaturedListings = catchAsync(async (req, res) => {
  const listings = await listingService.getFeaturedListings();
  sendResponse(res, 200, listings, 'Featured listings retrieved');
});

/**
 * @desc    Get marketplace stats
 * @route   GET /api/v1/listings/stats
 * @access  Public
 */
const getMarketplaceStats = catchAsync(async (req, res) => {
  const stats = await listingService.getMarketplaceStats();
  sendResponse(res, 200, stats, 'Marketplace stats retrieved');
});

/**
 * @desc    Upload images for a listing
 * @route   POST /api/v1/listings/:id/images
 * @access  Private (provider)
 */
const uploadListingImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendResponse(res, 400, null, 'No images provided');
  }
  const listing = await listingService.uploadListingImages(req.params.id, req.user._id, req.files);
  sendResponse(res, 200, listing, 'Images uploaded successfully');
});

module.exports = {
  searchListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  getFeaturedListings,
  getMarketplaceStats,
  uploadListingImages,
};
