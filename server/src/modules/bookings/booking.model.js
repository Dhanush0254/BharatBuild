const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    dates: {
      start: {
        type: Date,
        required: [true, 'Start date is required'],
      },
      end: {
        type: Date,
        required: [true, 'End date is required'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    // V2: Rebooking support
    isRebooking: {
      type: Boolean,
      default: false,
    },
    previousBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    // Provider can leave a completion note
    completionNote: {
      type: String,
      default: '',
    },
    // V3: Service location — seeker's GPS so provider can navigate
    serviceLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
    serviceAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
bookingSchema.index({ seeker: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ listing: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'dates.start': 1, 'dates.end': 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
