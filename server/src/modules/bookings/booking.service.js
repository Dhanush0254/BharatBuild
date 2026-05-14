const Booking = require('./booking.model');
const Listing = require('../listings/listing.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create a new booking (seeker flow).
 */
const createBooking = async (data, seekerId) => {
  const listing = await Listing.findById(data.listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (listing.status !== 'approved') throw new ApiError(400, 'Listing is not available for booking');
  if (listing.workerStatus === 'unavailable') throw new ApiError(400, 'This worker/service is currently unavailable');

  // Check for date conflicts
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const conflicting = await Booking.findOne({
    listing: listing._id,
    status: { $in: ['pending', 'accepted'] },
    'dates.start': { $lte: endDate },
    'dates.end': { $gte: startDate },
  });

  if (conflicting) {
    throw new ApiError(400, 'These dates are already booked. Please choose different dates.');
  }

  // Build serviceLocation if provided
  const serviceLocationData = data.serviceLocation ? {
    type: 'Point',
    coordinates: [data.serviceLocation.lng, data.serviceLocation.lat],
  } : undefined;

  const booking = await Booking.create({
    listing: listing._id,
    seeker: seekerId,
    provider: listing.provider,
    dates: { start: startDate, end: endDate },
    totalAmount: data.totalAmount,
    notes: data.notes || '',
    isRebooking: data.isRebooking || false,
    previousBooking: data.previousBooking || undefined,
    serviceLocation: serviceLocationData,
    serviceAddress: data.serviceAddress || '',
  });

  return booking;
};

/**
 * Get a single booking by ID.
 */
const getBookingById = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId)
    .populate('listing', 'title category subCategory pricing address images workerStatus')
    .populate('seeker', 'name email phone profileImage')
    .populate('provider', 'name email phone profileImage');

  if (!booking) throw new ApiError(404, 'Booking not found');

  // Only participants can view the booking
  const isParticipant =
    booking.seeker._id.toString() === userId.toString() ||
    booking.provider._id.toString() === userId.toString();

  if (!isParticipant) throw new ApiError(403, 'Not authorized to view this booking');

  return booking;
};

/**
 * Get seeker's bookings.
 */
const getSeekerBookings = async (seekerId, { status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = { seeker: seekerId };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('listing', 'title category subCategory pricing address images workerStatus ratings location')
      .populate('provider', 'name phone profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get provider's bookings.
 */
const getProviderBookings = async (providerId, { status, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const filter = { provider: providerId };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('listing', 'title category subCategory pricing address images')
      .populate('seeker', 'name phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Update booking status (provider action: accept/reject/complete).
 */
const updateBookingStatus = async (bookingId, status, providerId, completionNote) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.provider.toString() !== providerId.toString()) {
    throw new ApiError(403, 'Not authorized to update this booking');
  }

  // Validate state transitions
  const validTransitions = {
    pending: ['accepted', 'rejected'],
    accepted: ['completed', 'cancelled'],
    rejected: [],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw new ApiError(400, `Cannot transition from "${booking.status}" to "${status}"`);
  }

  booking.status = status;
  if (completionNote) booking.completionNote = completionNote;

  // If accepted, mark dates as unavailable on the listing
  if (status === 'accepted') {
    const listing = await Listing.findById(booking.listing);
    if (listing) {
      listing.unavailableDates.push({
        start: booking.dates.start,
        end: booking.dates.end,
      });
      listing.workerStatus = 'busy';
      await listing.save();
    }
  }

  // If completed, set worker status back to active
  if (status === 'completed') {
    const listing = await Listing.findById(booking.listing);
    if (listing) {
      // Check if there are other active bookings
      const otherActive = await Booking.countDocuments({
        listing: listing._id,
        status: 'accepted',
        _id: { $ne: bookingId },
      });
      if (otherActive === 0) {
        listing.workerStatus = 'active';
      }
      await listing.save();
    }
  }

  await booking.save();
  return booking;
};

/**
 * Cancel a booking (seeker can cancel pending bookings).
 */
const cancelBooking = async (bookingId, seekerId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.seeker.toString() !== seekerId.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this booking');
  }

  if (!['pending'].includes(booking.status)) {
    throw new ApiError(400, 'Only pending bookings can be cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking;
};

/**
 * Rebook a previously completed booking (seeker flow).
 */
const rebookWorker = async (previousBookingId, data, seekerId) => {
  const previous = await Booking.findById(previousBookingId).populate('listing');
  if (!previous) throw new ApiError(404, 'Previous booking not found');
  if (previous.seeker.toString() !== seekerId.toString()) {
    throw new ApiError(403, 'Not authorized to rebook this');
  }
  if (previous.status !== 'completed') {
    throw new ApiError(400, 'Can only rebook completed bookings');
  }

  const booking = await createBooking(
    {
      listingId: previous.listing._id.toString(),
      startDate: data.startDate,
      endDate: data.endDate,
      totalAmount: data.totalAmount,
      notes: data.notes || '',
      isRebooking: true,
      previousBooking: previousBookingId,
    },
    seekerId
  );

  return booking;
};

/**
 * Get booking stats for admin dashboard.
 */
const getBookingStats = async () => {
  const [total, pending, accepted, completed] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'accepted' }),
    Booking.countDocuments({ status: 'completed' }),
  ]);

  return { total, pending, accepted, completed };
};

module.exports = {
  createBooking,
  getBookingById,
  getSeekerBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  rebookWorker,
  getBookingStats,
};
