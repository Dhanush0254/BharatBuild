const inquiryService = require('./inquiry.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Send an inquiry on a listing
 * @route   POST /api/v1/inquiries
 * @access  Private (seeker)
 */
const createInquiry = catchAsync(async (req, res) => {
  const inquiry = await inquiryService.createInquiry({
    ...req.body,
    seekerId: req.user._id,
  });
  sendResponse(res, 201, inquiry, 'Inquiry sent successfully');
});

/**
 * @desc    Get my sent inquiries (seeker view)
 * @route   GET /api/v1/inquiries/sent
 * @access  Private (seeker)
 */
const getMySentInquiries = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await inquiryService.getSeekerInquiries(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Sent inquiries retrieved');
});

/**
 * @desc    Get inquiries received on my listings (provider view)
 * @route   GET /api/v1/inquiries/received
 * @access  Private (provider)
 */
const getReceivedInquiries = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await inquiryService.getProviderInquiries(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Received inquiries retrieved');
});

/**
 * @desc    Update inquiry status
 * @route   PATCH /api/v1/inquiries/:id/status
 * @access  Private (provider)
 */
const updateInquiryStatus = catchAsync(async (req, res) => {
  const inquiry = await inquiryService.updateInquiryStatus(
    req.params.id,
    req.body.status,
    req.user._id
  );
  sendResponse(res, 200, inquiry, 'Inquiry status updated');
});

module.exports = {
  createInquiry,
  getMySentInquiries,
  getReceivedInquiries,
  updateInquiryStatus,
};
