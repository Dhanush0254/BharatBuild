const express = require('express');
const inquiryController = require('./inquiry.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { createInquirySchema, updateInquiryStatusSchema } = require('./inquiry.validation');

const router = express.Router();

// All inquiry routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize('seeker'),
  validate(createInquirySchema),
  inquiryController.createInquiry
);

router.get('/sent', authorize('seeker'), inquiryController.getMySentInquiries);
router.get('/received', authorize('provider'), inquiryController.getReceivedInquiries);

router.patch(
  '/:id/status',
  authorize('provider'),
  validate(updateInquiryStatusSchema),
  inquiryController.updateInquiryStatus
);

module.exports = router;
