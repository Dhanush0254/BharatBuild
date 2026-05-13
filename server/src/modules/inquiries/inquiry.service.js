const Inquiry = require('./inquiry.model');
const Listing = require('../listings/listing.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create a new inquiry from a seeker to a provider.
 */
const createInquiry = async ({ listingId, message, contactPhone, seekerId }) => {
  // Verify listing exists and is approved
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }
  if (listing.status !== 'approved') {
    throw new ApiError(400, 'Cannot send inquiry to a non-approved listing');
  }

  // Prevent self-inquiry
  if (listing.provider && listing.provider.toString() === seekerId.toString()) {
    throw new ApiError(400, 'You cannot send an inquiry to your own listing');
  }

  const inquiry = await Inquiry.create({
    listing: listingId,
    seeker: seekerId,
    provider: listing.provider,
    message,
    contactPhone,
  });

  // Increment inquiry count on listing (fire-and-forget)
  Listing.findByIdAndUpdate(listingId, { $inc: { inquiryCount: 1 } }).catch((err) =>
    console.error('Failed to increment inquiry count:', err.message)
  );

  return inquiry;
};

/**
 * Get inquiries sent by a seeker.
 */
const getSeekerInquiries = async (seekerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    Inquiry.find({ seeker: seekerId })
      .populate('listing', 'title category subCategory pricing address images')
      .populate('provider', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Inquiry.countDocuments({ seeker: seekerId }),
  ]);

  return {
    inquiries,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get inquiries received by a provider.
 */
const getProviderInquiries = async (providerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [inquiries, total] = await Promise.all([
    Inquiry.find({ provider: providerId })
      .populate('listing', 'title category subCategory pricing')
      .populate('seeker', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Inquiry.countDocuments({ provider: providerId }),
  ]);

  return {
    inquiries,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Update inquiry status (provider can mark as responded/closed).
 */
const updateInquiryStatus = async (inquiryId, status, userId) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  // Only the provider of this inquiry can update status
  if (inquiry.provider.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this inquiry');
  }

  inquiry.status = status;
  await inquiry.save();

  return inquiry;
};

module.exports = {
  createInquiry,
  getSeekerInquiries,
  getProviderInquiries,
  updateInquiryStatus,
};
