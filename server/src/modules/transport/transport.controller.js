const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const transportService = require('./transport.service');

const create = catchAsync(async (req, res) => {
  const booking = await transportService.createBooking(req.user._id, req.body);
  sendResponse(res, 201, { booking }, 'Transport booking created');
});

const assignDriver = catchAsync(async (req, res) => {
  const booking = await transportService.assignDriver(
    req.params.id, req.body.vehicleId, req.body.driverId || req.user._id
  );
  sendResponse(res, 200, { booking }, 'Driver assigned');
});

const updateStatus = catchAsync(async (req, res) => {
  const booking = await transportService.updateStatus(
    req.params.id, req.body.status, req.user._id, req.user.role, req.body.note
  );
  sendResponse(res, 200, { booking }, 'Status updated');
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await transportService.getRequesterBookings(req.user._id, req.query);
  sendResponse(res, 200, result, 'Bookings fetched');
});

const getDriverBookings = catchAsync(async (req, res) => {
  const result = await transportService.getDriverBookings(req.user._id, req.query);
  sendResponse(res, 200, result, 'Driver bookings fetched');
});

const getById = catchAsync(async (req, res) => {
  const booking = await transportService.getBookingById(req.params.id);
  sendResponse(res, 200, { booking }, 'Booking fetched');
});

const getNearbyDrivers = catchAsync(async (req, res) => {
  const { lng, lat, vehicleType, radius } = req.query;
  const drivers = await transportService.getNearbyDrivers(lng, lat, vehicleType, radius);
  sendResponse(res, 200, { drivers }, 'Nearby drivers');
});

const estimatePrice = catchAsync(async (req, res) => {
  const estimate = await transportService.estimatePrice(req.query);
  sendResponse(res, 200, { estimate }, 'Price estimate');
});

module.exports = {
  create, assignDriver, updateStatus, getMyBookings,
  getDriverBookings, getById, getNearbyDrivers, estimatePrice,
};
