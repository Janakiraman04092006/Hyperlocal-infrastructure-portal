const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC USER INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // =========================
    // USER ROLE
    // =========================

    role: {
      type: String,
      enum: ['Citizen', 'Officer', 'Admin'],
      default: 'Citizen',
      index: true,
    },

    // =========================
    // OFFICER INFORMATION
    // =========================

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',

      required: function () {
        return (
          this.role === 'Officer' ||
          this.role === 'Admin'
        );
      },
    },

    // =========================
    // ACCOUNT STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // FIRST LOGIN / PASSWORD
    // =========================

    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    // =========================
    // OFFICER VERIFICATION OTP
    // =========================

    otpHash: {
      type: String,
      default: null,
    },

    otpExpiresAt: {
      type: Date,
      default: null,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    lastOtpSentAt: {
      type: Date,
      default: null,
    },

    // =========================
    // LOGIN OTP
    // =========================

    loginOtpHash: {
      type: String,
      default: null,
    },

    loginOtpExpiresAt: {
      type: Date,
      default: null,
    },

    loginOtpAttempts: {
      type: Number,
      default: 0,
    },

    lastLoginOtpSentAt: {
      type: Date,
      default: null,
    },

    // =========================
    // ACCOUNT TIMESTAMPS
    // =========================

    verifiedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },

  // ==========================================
  // MONGOOSE AUTOMATIC TIMESTAMPS
  // ==========================================

  {
    timestamps: true,
  }
);


// ==========================================
// EXPORT USER MODEL
// ==========================================

module.exports =
  mongoose.model('User', userSchema);