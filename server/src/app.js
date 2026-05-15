const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Module Routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const listingRoutes = require('./modules/listings/listing.routes');
const inquiryRoutes = require('./modules/inquiries/inquiry.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const reviewRoutes = require('./modules/reviews/review.routes');
const chatRoutes = require('./modules/chats/chat.routes');
const aiRoutes = require('./modules/ai/ai.routes');

// V3: Commerce & Logistics
const productRoutes = require('./modules/products/product.routes');
const cartRoutes = require('./modules/carts/cart.routes');
const orderRoutes = require('./modules/orders/order.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const transportRoutes = require('./modules/transport/transport.routes');

const app = express();

// ── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow configured CLIENT_URL, any onrender.com subdomain, and localhost
    const allowed = [
      env.clientUrl,
      /\.onrender\.com$/,
      /^http:\/\/localhost(:\d+)?$/,
    ];
    const isAllowed = allowed.some(pattern => {
      if (typeof pattern === 'string') return origin === pattern;
      return pattern.test(origin);
    });
    if (isAllowed) return callback(null, true);
    callback(null, true); // Allow all in free tier — tighten in production
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging (dev only) ───────────────────────────────────────────────────────
if (env.env === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'BharatBuild API is running', env: env.env });
});

// ── Mount Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/ai', aiRoutes);

// V3: Commerce & Logistics
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/transport', transportRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BharatBuild API is running. Use /api/v1 for endpoints.',
    env: env.env
  });
});

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
