const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'cement', 'sand', 'bricks', 'steel', 'tiles',
        'paint', 'gravel', 'hardware', 'plumbing',
        'electrical', 'wood', 'glass', 'waterproofing',
        'adhesives', 'pipes', 'tools', 'safety', 'other',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [{
      url: String,
      publicId: String,
    }],
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      // e.g., 'per bag', 'per ton', 'per sq ft', 'per piece', 'per tractor load'
    },
    stockQuantity: {
      type: Number,
      default: -1, // -1 means unlimited/not tracked
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    // Delivery options
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    pickupAvailable: {
      type: Boolean,
      default: true,
    },
    estimatedDeliveryTime: {
      type: String,
      default: '', // e.g., "Same day", "1-2 days", "2-3 hours"
    },
    deliveryRadius: {
      type: Number,
      default: 10, // km
    },
    // Location (inherited from shop, but can be overridden)
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
    // Tags for search
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    // Brand info
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    // Specs (flexible key-value)
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Ratings (aggregated)
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock', 'pending_review'],
      default: 'active',
    },
    // Stats
    viewCount: {
      type: Number,
      default: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    // Minimum order
    minOrderQty: {
      type: Number,
      default: 1,
    },
    // Bulk pricing tiers
    bulkPricing: [{
      minQty: Number,
      price: Number,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ location: '2dsphere' });
productSchema.index({ shop: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ tags: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ status: 1, inStock: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
