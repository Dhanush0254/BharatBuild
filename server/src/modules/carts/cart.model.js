const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    priceAtAdd: {
      type: Number,
      required: true, // snapshot price when added
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
    // Delivery preference (can be set at checkout)
    deliveryMethod: {
      type: String,
      enum: ['self_pickup', 'shop_delivery', 'bharatbuild_delivery'],
      default: 'self_pickup',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for estimated total
cartSchema.virtual('estimatedTotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

// Indexes
cartSchema.index({ user: 1 });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
