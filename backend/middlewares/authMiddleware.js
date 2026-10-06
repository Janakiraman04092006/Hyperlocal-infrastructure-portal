const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes that require authentication.
 *
 * Expects:
 * Authorization: Bearer <JWT_TOKEN>
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Authentication token is required.',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid authentication token.',
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id)
      .select('-password -otpHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    // Check whether account is active
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();

  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication server error.',
    });
  }
};


/**
 * Restrict a route to specific roles.
 *
 * Example:
 * router.post('/officers', protect, authorize('Admin'), controller);
 */
const authorize = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
};


/**
 * Admin-only middleware.
 */
const adminOnly = authorize('Admin');


/**
 * Officer-only middleware.
 */
const officerOnly = authorize('Officer');


/**
 * Citizen-only middleware.
 */
const citizenOnly = authorize('Citizen');


module.exports = {
  protect,
  authorize,
  adminOnly,
  officerOnly,
  citizenOnly,
};