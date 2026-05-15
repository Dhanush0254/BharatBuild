const TransportBooking = require('./transport.model');
const Vehicle = require('../vehicles/vehicle.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create a transport booking request
 */
const createBooking = async (requesterId, data) => {
  const {
    pickup, drop, vehicleTypeRequested, cargoDescription,
    estimatedWeight, scheduledDate, orderId,
  } = data;

  // Estimate distance (simple Haversine approximation)
  const distKm = haversineDistance(
    pickup.location.coordinates[1], pickup.location.coordinates[0],
    drop.location.coordinates[1], drop.location.coordinates[0]
  );

  // Find nearby vehicles to estimate price
  const nearbyVehicles = await Vehicle.find({
    isAvailable: true,
    ...(vehicleTypeRequested && vehicleTypeRequested !== 'any' ? { vehicleType: vehicleTypeRequested } : {}),
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: pickup.location.coordinates },
        $maxDistance: 30000, // 30km
      },
    },
  }).limit(5);

  const avgPricePerKm = nearbyVehicles.length > 0
    ? nearbyVehicles.reduce((sum, v) => sum + v.pricingPerKm, 0) / nearbyVehicles.length
    : 15; // default ₹15/km

  const estimatedPrice = Math.round(Math.max(avgPricePerKm * distKm, 200)); // min ₹200

  const booking = await TransportBooking.create({
    requester: requesterId,
    pickup,
    drop,
    vehicleTypeRequested: vehicleTypeRequested || 'any',
    cargoDescription: cargoDescription || '',
    estimatedWeight: estimatedWeight || 0,
    estimatedDistance: Math.round(distKm * 10) / 10,
    estimatedPrice,
    scheduledDate: scheduledDate || new Date(),
    order: orderId || undefined,
    status: 'searching_driver',
    statusHistory: [{ status: 'searching_driver', timestamp: new Date() }],
  });

  return booking;
};

/**
 * Assign a driver/vehicle to a booking
 */
const assignDriver = async (bookingId, vehicleId, driverId) => {
  const booking = await TransportBooking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Transport booking not found');
  if (booking.status !== 'searching_driver') {
    throw new ApiError(400, 'Driver already assigned or booking cancelled');
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  booking.vehicle = vehicleId;
  booking.driver = driverId;
  booking.status = 'driver_assigned';
  booking.finalPrice = booking.estimatedPrice; // can be negotiated
  booking.statusHistory.push({ status: 'driver_assigned', timestamp: new Date() });

  // Mark vehicle as unavailable
  vehicle.isAvailable = false;
  await vehicle.save();
  await booking.save();

  return booking;
};

/**
 * Update transport status
 */
const updateStatus = async (bookingId, newStatus, userId, userRole, note = '') => {
  const booking = await TransportBooking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Transport booking not found');

  const isDriver = booking.driver && booking.driver.toString() === userId.toString();
  const isRequester = booking.requester.toString() === userId.toString();

  if (userRole !== 'admin' && !isDriver && !isRequester) {
    throw new ApiError(403, 'Not authorized');
  }

  const validTransitions = {
    searching_driver: ['driver_assigned', 'cancelled'],
    driver_assigned: ['picked_up', 'cancelled'],
    picked_up: ['in_transit'],
    in_transit: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status]?.includes(newStatus)) {
    throw new ApiError(400, `Cannot transition from ${booking.status} to ${newStatus}`);
  }

  booking.status = newStatus;
  booking.statusHistory.push({ status: newStatus, timestamp: new Date(), note });

  // If delivered, free up vehicle and increment trips
  if (newStatus === 'delivered' && booking.vehicle) {
    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      isAvailable: true,
      $inc: { tripsCompleted: 1 },
    });
  }

  // If cancelled, free up vehicle
  if (newStatus === 'cancelled' && booking.vehicle) {
    await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: true });
  }

  await booking.save();
  return booking;
};

/**
 * Get bookings for requester
 */
const getRequesterBookings = async (userId, { page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;
  const filter = { requester: userId };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    TransportBooking.find(filter)
      .populate('vehicle')
      .populate('driver', 'name phone profileImage')
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    TransportBooking.countDocuments(filter),
  ]);

  return { bookings, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

/**
 * Get bookings for driver
 */
const getDriverBookings = async (driverId, { page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;
  const filter = { driver: driverId };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    TransportBooking.find(filter)
      .populate('requester', 'name phone')
      .populate('vehicle')
      .sort({ createdAt: -1 }).skip(skip).limit(limit),
    TransportBooking.countDocuments(filter),
  ]);

  return { bookings, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

/**
 * Get booking by ID
 */
const getBookingById = async (id) => {
  const booking = await TransportBooking.findById(id)
    .populate('requester', 'name phone address')
    .populate('driver', 'name phone profileImage')
    .populate('vehicle')
    .populate('order');

  if (!booking) throw new ApiError(404, 'Transport booking not found');
  return booking;
};

/**
 * Get nearby available drivers for a location
 */
const getNearbyDrivers = async (lng, lat, vehicleType, radius = 20) => {
  const filter = {
    isAvailable: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius) * 1000,
      },
    },
  };
  if (vehicleType && vehicleType !== 'any') filter.vehicleType = vehicleType;

  const vehicles = await Vehicle.find(filter)
    .populate('owner', 'name phone profileImage')
    .limit(20);

  return vehicles;
};

/**
 * Estimate price for a transport request
 */
const estimatePrice = async ({ pickupLng, pickupLat, dropLng, dropLat, vehicleType }) => {
  const distKm = haversineDistance(
    parseFloat(pickupLat), parseFloat(pickupLng),
    parseFloat(dropLat), parseFloat(dropLng)
  );

  // Get avg pricing from nearby vehicles
  const vehicles = await Vehicle.find({
    isAvailable: true,
    ...(vehicleType && vehicleType !== 'any' ? { vehicleType } : {}),
  }).limit(20);

  const avgRate = vehicles.length > 0
    ? vehicles.reduce((s, v) => s + v.pricingPerKm, 0) / vehicles.length
    : 15;

  const estimated = Math.round(Math.max(avgRate * distKm, 200));

  return {
    distance: Math.round(distKm * 10) / 10,
    estimatedPrice: estimated,
    priceRange: {
      low: Math.round(estimated * 0.8),
      high: Math.round(estimated * 1.3),
    },
    availableDrivers: vehicles.length,
  };
};

// ── Haversine helper ──
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = {
  createBooking, assignDriver, updateStatus,
  getRequesterBookings, getDriverBookings, getBookingById,
  getNearbyDrivers, estimatePrice,
};
