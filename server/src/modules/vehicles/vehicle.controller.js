const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const vehicleService = require('./vehicle.service');

const register = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.registerVehicle(req.body, req.user._id);
  sendResponse(res, 201, { vehicle }, 'Vehicle registered');
});

const getMyVehicles = catchAsync(async (req, res) => {
  const vehicles = await vehicleService.getOwnerVehicles(req.user._id);
  sendResponse(res, 200, { vehicles }, 'Vehicles fetched');
});

const update = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user._id);
  sendResponse(res, 200, { vehicle }, 'Vehicle updated');
});

const remove = catchAsync(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id, req.user._id, req.user.role);
  sendResponse(res, 200, null, 'Vehicle deleted');
});

const searchNearby = catchAsync(async (req, res) => {
  const result = await vehicleService.searchNearbyVehicles(req.query);
  sendResponse(res, 200, result, 'Nearby vehicles');
});

const getById = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);
  sendResponse(res, 200, { vehicle }, 'Vehicle fetched');
});

const toggleAvailability = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.toggleAvailability(req.params.id, req.user._id);
  sendResponse(res, 200, { vehicle }, 'Availability toggled');
});

module.exports = { register, getMyVehicles, update, remove, searchNearby, getById, toggleAvailability };
