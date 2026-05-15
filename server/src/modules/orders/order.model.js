const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    title: String,       // snapshot
    price: Number,       // snapshot
    unit: String,        // snapshot
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Shop is required'],
    },
    items: {
      type: [orderItemSchema],
      validate: [arr => arr.length > 0, 'Order must have at least one item'],
    },
    // Pricing
    itemsTotal: {
      type: Number,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Delivery
    deliveryMethod: {
      type: String,
      enum: ['self_pickup', 'shop_delivery', 'bharatbuild_delivery'],
      required: true,
    },
    deliveryAddress: {
      street: String,
      area: String,
      city: { type: String, default: 'Hyderabad' },
      district: String,
      pincode: String,
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number],
    },
    // Order lifecycle
    status: {
      type: String,
      enum: [
        'pending',        // just placed
        'accepted',       // shop confirmed
        'preparing',      // shop preparing items
        'out_for_delivery', // picked up / on the way
        'completed',      // delivered / picked up
        'cancelled',      // cancelled by buyer or shop
      ],
      default: 'pending',
    },
    // Transport link (if using BharatBuild delivery)
    transportBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportBooking',
    },
    // Notes
    buyerNotes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    shopNotes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Timestamps for each status change
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
    }],
    // Estimated delivery
    estimatedDelivery: {
      type: String,
      default: '',
    },
    // Rating (after completion)
    isRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ shop: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ deliveryLocation: '2dsphere' });

// Auto-generate order number
orderSchema.pre('validate', function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `BB-${timestamp}-${random}`;
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
