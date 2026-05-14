const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['workers', 'machinery', 'materials', 'repairs'],
    required: [true, 'Category is required'],
  },
  subCategory: {
    type: String,
    required: [true, 'Subcategory is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  pricing: {
    amount: {
      type: Number,
      required: [true, 'Price amount is required'],
    },
    unit: {
      type: String,
      required: [true, 'Price unit is required (e.g., per day, per hour, per bag)'],
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    }
  },
  address: {
    street: String,
    area: String, // e.g., Kukatpally, Miyapur
    city: { type: String, default: 'Hyderabad' },
    district: String, // e.g., Medchal-Malkajgiri
    state: { type: String, default: 'Telangana' },
    pincode: String,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    // Flexible fields based on category (e.g., brand for cement, experience years for worker)
  },
  availability: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved', // Defaulting to approved for Phase 1 seed
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  inquiryCount: {
    type: Number,
    default: 0,
  },

  // ── V2: Worker/Provider Status ────────────────────────────────────
  workerStatus: {
    type: String,
    enum: ['active', 'busy', 'unavailable'],
    default: 'active',
  },

  // ── V2: Ratings (aggregated from reviews) ─────────────────────────
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },

  // ── V2: Unavailable dates (blocked by bookings) ───────────────────
  unavailableDates: [{
    start: Date,
    end: Date,
  }],

  // ── V2: Verified Material Shop ────────────────────────────────────
  isVerified: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
});

// VERY IMPORTANT: 2dsphere index for geospatial queries
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ category: 1, subCategory: 1 });
listingSchema.index({ 'address.area': 1 });
listingSchema.index({ workerStatus: 1 });
listingSchema.index({ 'ratings.average': -1 });

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
