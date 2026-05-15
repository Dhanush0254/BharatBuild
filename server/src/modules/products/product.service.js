const Product = require('./product.model');
const ApiError = require('../../utils/ApiError');
const { buildGeoNearStage } = require('../../utils/geoHelpers');

/**
 * Search products with geo, filtering, and pagination.
 */
const searchProducts = async (query) => {
  const {
    lng, lat, radius = 30,
    category, subcategory, brand,
    minPrice, maxPrice,
    search, tags,
    inStock, deliveryAvailable, isVerified,
    shopId,
    page = 1, limit = 12,
    sort = 'relevance',
  } = query;

  const pipeline = [];

  // 1. $geoNear (must be first)
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

  // 2. Match filters
  const matchStage = { status: 'active' };

  if (category) matchStage.category = category.toLowerCase();
  if (subcategory) matchStage.subcategory = new RegExp(subcategory, 'i');
  if (brand) matchStage.brand = new RegExp(brand, 'i');
  if (shopId) matchStage.shop = require('mongoose').Types.ObjectId.createFromHexString(shopId);

  if (minPrice || maxPrice) {
    matchStage.price = {};
    if (minPrice) matchStage.price.$gte = parseFloat(minPrice);
    if (maxPrice) matchStage.price.$lte = parseFloat(maxPrice);
  }

  if (search) {
    matchStage.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (tags) {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase());
    matchStage.tags = { $in: tagList };
  }

  if (inStock === 'true') matchStage.inStock = true;
  if (deliveryAvailable === 'true') matchStage.deliveryAvailable = true;
  if (isVerified === 'true') matchStage.isVerified = true;

  pipeline.push({ $match: matchStage });

  // 3. Sorting
  if (!isNaN(parsedLng) && !isNaN(parsedLat) && sort === 'nearest') {
    // already sorted by $geoNear
  } else if (sort === 'price_asc') {
    pipeline.push({ $sort: { price: 1 } });
  } else if (sort === 'price_desc') {
    pipeline.push({ $sort: { price: -1 } });
  } else if (sort === 'rating') {
    pipeline.push({ $sort: { 'ratings.average': -1 } });
  } else if (sort === 'popular') {
    pipeline.push({ $sort: { orderCount: -1, viewCount: -1 } });
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
            localField: 'shop',
            foreignField: '_id',
            as: 'shopInfo',
            pipeline: [
              { $project: { name: 1, phone: 1, profileImage: 1, verificationStatus: 1, address: 1 } },
            ],
          },
        },
        {
          $addFields: {
            shopInfo: { $arrayElemAt: ['$shopInfo', 0] },
          },
        },
      ],
    },
  });

  const result = await Product.aggregate(pipeline);
  const data = result[0].data;
  const total = result[0].metadata[0]?.total || 0;

  return {
    products: data,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
  const product = await Product.findById(id).populate(
    'shop', 'name email phone profileImage address verificationStatus'
  );
  if (!product) throw new ApiError(404, 'Product not found');

  // Increment view count
  product.viewCount += 1;
  await product.save();

  return product;
};

/**
 * Create product (shop owner)
 */
const createProduct = async (data, shopId) => {
  const product = await Product.create({
    ...data,
    shop: shopId,
  });
  return product;
};

/**
 * Update product
 */
const updateProduct = async (productId, data, shopId) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.shop.toString() !== shopId.toString()) {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  Object.assign(product, data);
  await product.save();
  return product;
};

/**
 * Delete product
 */
const deleteProduct = async (productId, userId, userRole) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (userRole !== 'admin' && product.shop.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this product');
  }
  await product.deleteOne();
  return { id: productId };
};

/**
 * Get products by shop
 */
const getShopProducts = async (shopId, { page = 1, limit = 20, category, status }) => {
  const skip = (page - 1) * limit;
  const filter = { shop: shopId };
  if (category) filter.category = category;
  if (status) filter.status = status;

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get product categories with counts (for browse page)
 */
const getProductCategories = async (query = {}) => {
  const { lng, lat, radius = 30 } = query;
  const pipeline = [];

  const parsedLng = parseFloat(lng);
  const parsedLat = parseFloat(lat);
  if (!isNaN(parsedLng) && !isNaN(parsedLat)) {
    pipeline.push(buildGeoNearStage(parsedLng, parsedLat, radius));
  }

  pipeline.push(
    { $match: { status: 'active', inStock: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    { $sort: { count: -1 } }
  );

  return Product.aggregate(pipeline);
};

/**
 * Get featured/popular products
 */
const getFeaturedProducts = async (limit = 8) => {
  return Product.find({ status: 'active', inStock: true })
    .sort({ orderCount: -1, 'ratings.average': -1, viewCount: -1 })
    .limit(limit)
    .populate('shop', 'name profileImage address verificationStatus');
};

/**
 * Get shop analytics
 */
const getShopAnalytics = async (shopId) => {
  const [totalProducts, activeProducts, outOfStock, totalViews, totalOrders, categoryBreakdown] = await Promise.all([
    Product.countDocuments({ shop: shopId }),
    Product.countDocuments({ shop: shopId, status: 'active', inStock: true }),
    Product.countDocuments({ shop: shopId, inStock: false }),
    Product.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
      { $group: { _id: null, total: { $sum: '$viewCount' } } },
    ]),
    Product.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
      { $group: { _id: null, total: { $sum: '$orderCount' } } },
    ]),
    Product.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(shopId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    totalProducts,
    activeProducts,
    outOfStock,
    totalViews: totalViews[0]?.total || 0,
    totalOrders: totalOrders[0]?.total || 0,
    categoryBreakdown,
  };
};

module.exports = {
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getShopProducts,
  getProductCategories,
  getFeaturedProducts,
  getShopAnalytics,
};
