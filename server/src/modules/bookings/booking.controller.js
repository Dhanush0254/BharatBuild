const bookingService = require('./booking.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Create a new booking
 * @route   POST /api/v1/bookings
 * @access  Private (seeker)
 */
const createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user._id);
  sendResponse(res, 201, booking, 'Booking created — pending provider approval');
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/v1/bookings/:id
 * @access  Private (participant)
 */
const getBookingById = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user._id);
  sendResponse(res, 200, booking, 'Booking details retrieved');
});

/**
 * @desc    Get seeker's bookings
 * @route   GET /api/v1/bookings/my-bookings
 * @access  Private (seeker)
 */
const getSeekerBookings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const result = await bookingService.getSeekerBookings(req.user._id, {
    status,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Your bookings retrieved');
});

/**
 * @desc    Get provider's bookings
 * @route   GET /api/v1/bookings/provider
 * @access  Private (provider)
 */
const getProviderBookings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const result = await bookingService.getProviderBookings(req.user._id, {
    status,
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Provider bookings retrieved');
});

/**
 * @desc    Update booking status (provider)
 * @route   PATCH /api/v1/bookings/:id/status
 * @access  Private (provider)
 */
const updateBookingStatus = catchAsync(async (req, res) => {
  const { status, completionNote } = req.body;
  const booking = await bookingService.updateBookingStatus(
    req.params.id,
    status,
    req.user._id,
    completionNote
  );
  sendResponse(res, 200, booking, `Booking ${status}`);
});

/**
 * @desc    Cancel a pending booking (seeker)
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @access  Private (seeker)
 */
const cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id);
  sendResponse(res, 200, booking, 'Booking cancelled');
});

/**
 * @desc    Rebook a completed booking
 * @route   POST /api/v1/bookings/:id/rebook
 * @access  Private (seeker)
 */
const rebookWorker = catchAsync(async (req, res) => {
  const booking = await bookingService.rebookWorker(req.params.id, req.body, req.user._id);
  sendResponse(res, 201, booking, 'Worker rebooked — pending approval');
});

module.exports = {
  createBooking,
  getBookingById,
  getSeekerBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  rebookWorker,
};
