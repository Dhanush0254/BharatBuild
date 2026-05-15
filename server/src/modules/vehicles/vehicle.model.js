const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vehicle owner is required'],
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: [
        'tractor', 'mini_truck', 'pickup_auto',
        'lorry', 'tipper', 'load_vehicle',
        'tempo', 'bolero_pickup',
      ],
    },
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      trim: true,
      uppercase: true,
    },
    // Capacity
    capacity: {
      weight: { type: Number, default: 0 },  // in tons
      unit: { type: String, default: 'tons' },
      description: { type: String, default: '' }, // e.g., "3 ton capacity"
    },
    // Pricing
    pricingPerKm: {
      type: Number,
      required: [true, 'Pricing per km is required'],
      min: [0, 'Pricing cannot be negative'],
    },
    baseFare: {
      type: Number,
      default: 0, // minimum fare
    },
    // Location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    address: {
      area: String,
      city: { type: String, default: 'Hyderabad' },
      district: String,
      state: { type: String, default: 'Telangana' },
    },
    // Availability
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableHours: {
      from: { type: String, default: '06:00' },
      to: { type: String, default: '22:00' },
    },
    // Images
    images: [{
      url: String,
      publicId: String,
    }],
    // Verification
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    verificationDocs: {
      rc: { type: String, default: '' },         // Registration Certificate
      insurance: { type: String, default: '' },
      license: { type: String, default: '' },     // Driver license
      permit: { type: String, default: '' },      // Transport permit
    },
    // Ratings
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    // Stats
    tripsCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
vehicleSchema.index({ location: '2dsphere' });
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ vehicleType: 1, isAvailable: 1 });
vehicleSchema.index({ pricingPerKm: 1 });
vehicleSchema.index({ verificationStatus: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
