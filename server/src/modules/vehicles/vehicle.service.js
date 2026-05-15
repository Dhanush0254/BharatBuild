const Vehicle = require('./vehicle.model');
const ApiError = require('../../utils/ApiError');

/**
 * Register a vehicle
 */
const registerVehicle = async (data, ownerId) => {
  const vehicle = await Vehicle.create({ ...data, owner: ownerId });
  return vehicle;
};

/**
 * Get owner's vehicles
 */
const getOwnerVehicles = async (ownerId) => {
  return Vehicle.find({ owner: ownerId }).sort({ createdAt: -1 });
};

/**
 * Update vehicle
 */
const updateVehicle = async (vehicleId, data, ownerId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  Object.assign(vehicle, data);
  await vehicle.save();
  return vehicle;
};

/**
 * Delete vehicle
 */
const deleteVehicle = async (vehicleId, ownerId, userRole) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (userRole !== 'admin' && vehicle.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  await vehicle.deleteOne();
  return { id: vehicleId };
};

/**
 * Search nearby available vehicles
 */
const searchNearbyVehicles = async (query) => {
  const {
    lng, lat, radius = 20,
    vehicleType, minCapacity,
    page = 1, limit = 10,
  } = query;

  const pipeline = [];
  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);

  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    pipeline.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [parsedLng, parsedLat] },
        distanceField: 'distance',
        maxDistance: parseFloat(radius) * 1000,
        spherical: true,
      },
    });
  }

  const matchStage = { isAvailable: true };
  if (vehicleType && vehicleType !== 'any') matchStage.vehicleType = vehicleType;
  if (minCapacity) matchStage['capacity.weight'] = { $gte: parseFloat(minCapacity) };

  pipeline.push({ $match: matchStage });

  const skip = (parseInt(page) - 1) * parseInt(limit);

  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'ownerInfo',
            pipeline: [
              { $project: { name: 1, phone: 1, profileImage: 1, 'ratings': 1 } },
            ],
          },
        },
        { $addFields: { ownerInfo: { $arrayElemAt: ['$ownerInfo', 0] } } },
      ],
    },
  });

  const result = await Vehicle.aggregate(pipeline);
  return {
    vehicles: result[0].data,
    pagination: {
      total: result[0].metadata[0]?.total || 0,
      page: parseInt(page),
      pages: Math.ceil((result[0].metadata[0]?.total || 0) / parseInt(limit)),
    },
  };
};

/**
 * Get vehicle by ID
 */
const getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id).populate('owner', 'name phone profileImage address');
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  return vehicle;
};

/**
 * Toggle availability
 */
const toggleAvailability = async (vehicleId, ownerId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (vehicle.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Not authorized');
  }
  vehicle.isAvailable = !vehicle.isAvailable;
  await vehicle.save();
  return vehicle;
};

module.exports = {
  registerVehicle, getOwnerVehicles, updateVehicle,
  deleteVehicle, searchNearbyVehicles, getVehicleById, toggleAvailability,
};
