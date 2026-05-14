const adminService = require('./admin.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

const getStats = catchAsync(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  sendResponse(res, 200, stats, 'Dashboard stats retrieved');
});

const getPendingListings = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await adminService.getPendingListings({ page: parseInt(page), limit: parseInt(limit) });
  sendResponse(res, 200, result, 'Pending listings retrieved');
});

const moderateListing = catchAsync(async (req, res) => {
  const { action } = req.body;
  const listing = await adminService.moderateListing(req.params.id, action);
  sendResponse(res, 200, listing, `Listing ${action}`);
});

const getUsers = catchAsync(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const result = await adminService.getAllUsers({ role, page: parseInt(page), limit: parseInt(limit) });
  sendResponse(res, 200, result, 'Users retrieved');
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const user = await adminService.toggleUserStatus(req.params.id);
  sendResponse(res, 200, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

// V2: Verification management
const getVerificationRequests = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await adminService.getVerificationRequests({ page: parseInt(page), limit: parseInt(limit) });
  sendResponse(res, 200, result, 'Verification requests retrieved');
});

const handleVerification = catchAsync(async (req, res) => {
  const { action } = req.body;
  const user = await adminService.handleVerification(req.params.id, action);
  sendResponse(res, 200, user, `Provider ${action}`);
});

module.exports = {
  getStats,
  getPendingListings,
  moderateListing,
  getUsers,
  toggleUserStatus,
  getVerificationRequests,
  handleVerification,
};
