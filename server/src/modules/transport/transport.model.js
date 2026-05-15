const mongoose = require('mongoose');

const transportBookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },
    // Who requested the transport
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    // Which vehicle/driver
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Linked order (if delivering for an order)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    // Pickup details
    pickup: {
      address: { type: String, required: true },
      area: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
      contactName: String,
      contactPhone: String,
    },
    // Drop details
    drop: {
      address: { type: String, required: true },
      area: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
      contactName: String,
      contactPhone: String,
    },
    // Transport details
    vehicleTypeRequested: {
      type: String,
      enum: [
        'tractor', 'mini_truck', 'pickup_auto',
        'lorry', 'tipper', 'load_vehicle',
        'tempo', 'bolero_pickup', 'any',
      ],
      default: 'any',
    },
    cargoDescription: {
      type: String,
      default: '',
    },
    estimatedWeight: {
      type: Number,
      default: 0, // tons
    },
    // Distance & pricing
    estimatedDistance: {
      type: Number,
      default: 0, // km
    },
    estimatedPrice: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    // Status
    status: {
      type: String,
      enum: [
        'searching_driver',
        'driver_assigned',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
      ],
      default: 'searching_driver',
    },
    // Timeline
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    }],
    // Schedule
    scheduledDate: {
      type: Date,
    },
    // Rating
    rating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transportBookingSchema.index({ requester: 1, createdAt: -1 });
transportBookingSchema.index({ driver: 1, createdAt: -1 });
transportBookingSchema.index({ vehicle: 1 });
transportBookingSchema.index({ status: 1 });
transportBookingSchema.index({ order: 1 });
transportBookingSchema.index({ bookingNumber: 1 });
transportBookingSchema.index({ 'pickup.location': '2dsphere' });
transportBookingSchema.index({ 'drop.location': '2dsphere' });

// Auto-generate booking number
transportBookingSchema.pre('validate', function () {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingNumber = `TB-${timestamp}-${random}`;
  }
});

const TransportBooking = mongoose.model('TransportBooking', transportBookingSchema);
module.exports = TransportBooking;
