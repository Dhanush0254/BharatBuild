const Listing = require('./listing.model');
const ApiError = require('../../utils/ApiError');
const { buildGeoNearStage } = require('../../utils/geoHelpers');
const cloudinary = require('../../config/cloudinary');

/**
 * Search listings with geospatial, filtering, and pagination support.
 * Uses MongoDB aggregation pipeline.
 */
const searchListings = async (query) => {
  const {
    lng, lat, radius = 50,
    category, subCategory, area, district,
    minPrice, maxPrice,
    search,
    isVerified, isAvailable,
    page = 1, limit = 12,
    sort = 'newest',
  } = query;

  const pipeline = [];

  // 1. $geoNear (MUST be first stage if used)
  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    pipeline.push(buildGeoNearStage(parsedLng, parsedLat, radius));
  }

  // 2. $match filters
  const matchStage = { status: 'approved' };

  if (category) matchStage.category = category;
  if (subCategory) matchStage.subCategory = subCategory;
  if (area) matchStage['address.area'] = new RegExp(area, 'i');
  if (district) matchStage['address.district'] = new RegExp(district, 'i');

  if (minPrice || maxPrice) {
    matchStage['pricing.amount'] = {};
    if (minPrice) matchStage['pricing.amount'].$gte = parseFloat(minPrice);
    if (maxPrice) matchStage['pricing.amount'].$lte = parseFloat(maxPrice);
  }

  if (search) {
    matchStage.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subCategory: { $regex: search, $options: 'i' } },
    ];
  }

  if (isVerified === 'true') matchStage.isVerified = true;
  if (isAvailable === 'true') matchStage.workerStatus = 'active';

  pipeline.push({ $match: matchStage });

  // 3. Sorting
  if (!isNaN(parsedLng) && !isNaN(parsedLat) && sort === 'nearest') {
    // Already sorted by distance from $geoNear
  } else if (sort === 'price_asc') {
    pipeline.push({ $sort: { 'pricing.amount': 1 } });
  } else if (sort === 'price_desc') {
    pipeline.push({ $sort: { 'pricing.amount': -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // 4. Faceted pagination
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
            localField: 'provider',
            foreignField: '_id',
            as: 'providerInfo',
            pipeline: [
              { $project: { name: 1, phone: 1, profileImage: 1 } },
            ],
          },
        },
        {
          $addFields: {
            providerInfo: { $arrayElemAt: ['$providerInfo', 0] },
          },
        },
      ],
    },
  });

  const result = await Listing.aggregate(pipeline);

  const data = result[0].data;
  const total = result[0].metadata[0]?.total || 0;

  return {
    listings: data,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get single listing by ID with provider details.
 */
const getListingById = async (id) => {
  const listing = await Listing.findById(id).populate(
    'provider',
    'name email phone profileImage address'
  );

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  return listing;
};

/**
 * Create a new listing (provider flow).
 */
const createListing = async (data, providerId) => {
  const listing = await Listing.create({
    ...data,
    provider: providerId,
    status: 'pending', // Requires admin approval
  });

  return listing;
};

/**
 * Update a listing (provider can only update own listings).
 */
const updateListing = async (listingId, data, providerId) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (listing.provider.toString() !== providerId.toString()) {
    throw new ApiError(403, 'Not authorized to update this listing');
  }

  Object.assign(listing, data);
  // Re-set to pending after edit so admin can re-approve
  listing.status = 'pending';
  await listing.save();

  return listing;
};

/**
 * Delete a listing (provider or admin).
 */
const deleteListing = async (listingId, userId, userRole) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (userRole !== 'admin' && listing.provider.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this listing');
  }

  await listing.deleteOne();
  return { id: listingId };
};

/**
 * Get listings created by a specific provider.
 */
const getProviderListings = async (providerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    Listing.find({ provider: providerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments({ provider: providerId }),
  ]);

  return {
    listings,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get featured/popular listings for the landing page.
 */
const getFeaturedListings = async (limit = 8) => {
  return Listing.find({ status: 'approved' })
    .sort({ viewCount: -1, inquiryCount: -1 })
    .limit(limit)
    .populate('provider', 'name profileImage');
};

/**
 * Get marketplace stats for the landing page.
 */
const getMarketplaceStats = async () => {
  const [totalListings, totalProviders, categoryStats] = await Promise.all([
    Listing.countDocuments({ status: 'approved' }),
    Listing.distinct('provider').then((providers) => providers.length),
    Listing.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const categories = {};
  categoryStats.forEach((cat) => {
    categories[cat._id] = cat.count;
  });

  return {
    totalListings,
    totalProviders,
    categories,
    districts: 7, // Telangana districts covered (static for now)
  };
};

/**
 * Upload multiple images to Cloudinary and attach to listing
 */
const uploadListingImages = async (listingId, providerId, files) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (listing.provider.toString() !== providerId.toString()) {
    throw new ApiError(403, 'Not authorized to update this listing');
  }

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'bharatbuild/listings',
          transformation: [{ width: 800, crop: 'limit' }],
        },
        (error, result) => {
          if (error) return reject(new ApiError(500, 'Image upload failed'));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      uploadStream.end(file.buffer);
    });
  });

  const uploadedImages = await Promise.all(uploadPromises);
  
  listing.images.push(...uploadedImages);
  await listing.save();

  return listing;
};

module.exports = {
  searchListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getProviderListings,
  getFeaturedListings,
  getMarketplaceStats,
  uploadListingImages,
};
