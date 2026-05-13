const adminService = require('./admin.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

const getAllListings = catchAsync(async (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  const result = await adminService.getAllListings({
    status, category, page: parseInt(page), limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'All listings retrieved');
});

const getPendingListings = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await adminService.getPendingListings({
    page: parseInt(page), limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Pending listings retrieved');
});

const moderateListing = catchAsync(async (req, res) => {
  const listing = await adminService.moderateListing(req.params.id, req.body.action);
  sendResponse(res, 200, listing, `Listing ${req.body.action} successfully`);
});

const getAllUsers = catchAsync(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const result = await adminService.getAllUsers({
    role, page: parseInt(page), limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Users retrieved');
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id);
  sendResponse(res, 200, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendResponse(res, 200, stats, 'Dashboard stats retrieved');
});

module.exports = {
  getAllListings,
  getPendingListings,
  moderateListing,
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
};
