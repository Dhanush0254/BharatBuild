const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Exclude from queries by default
    },
    role: {
      type: String,
      enum: ['seeker', 'provider', 'admin'],
      default: 'seeker',
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
    address: {
      area: String,
      city: { type: String, default: 'Hyderabad' },
      district: String,
      state: { type: String, default: 'Telangana' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── V2: Verification (for material shop providers) ──────────────
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified'],
      default: 'unverified',
    },
    verificationDocs: {
      gst: { type: String, default: '' },
      shopLicense: { type: String, default: '' },
      shopPhotos: [String],
      addressProof: { type: String, default: '' },
      govPermissions: { type: String, default: '' },
    },

    // ── V2: Seeker — Saved workers / listings ───────────────────────
    savedWorkers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    }],

    // ── V2: Seeker — Recently viewed listings ───────────────────────
    recentlyViewed: [{
      listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
      viewedAt: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for optional geo queries on users
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
