const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seeker reference is required'],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider reference is required'],
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
inquirySchema.index({ seeker: 1, createdAt: -1 });
inquirySchema.index({ provider: 1, createdAt: -1 });
inquirySchema.index({ listing: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
module.exports = Inquiry;
