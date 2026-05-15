const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const productService = require('./product.service');

const search = catchAsync(async (req, res) => {
  const result = await productService.searchProducts(req.query);
  sendResponse(res, 200, result, 'Products fetched');
});

const getById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendResponse(res, 200, { product }, 'Product fetched');
});

const create = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.user._id);
  sendResponse(res, 201, { product }, 'Product created');
});

const update = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body, req.user._id);
  sendResponse(res, 200, { product }, 'Product updated');
});

const remove = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user._id, req.user.role);
  sendResponse(res, 200, null, 'Product deleted');
});

const getShopProducts = catchAsync(async (req, res) => {
  const shopId = req.params.shopId || req.user._id;
  const result = await productService.getShopProducts(shopId, req.query);
  sendResponse(res, 200, result, 'Shop products fetched');
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await productService.getProductCategories(req.query);
  sendResponse(res, 200, { categories }, 'Categories fetched');
});

const getFeatured = catchAsync(async (req, res) => {
  const products = await productService.getFeaturedProducts(parseInt(req.query.limit) || 8);
  sendResponse(res, 200, { products }, 'Featured products fetched');
});

const getAnalytics = catchAsync(async (req, res) => {
  const analytics = await productService.getShopAnalytics(req.user._id.toString());
  sendResponse(res, 200, { analytics }, 'Shop analytics fetched');
});

module.exports = { search, getById, create, update, remove, getShopProducts, getCategories, getFeatured, getAnalytics };
