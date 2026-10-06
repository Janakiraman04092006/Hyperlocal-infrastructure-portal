const express = require('express');

const router = express.Router();

const {
  createOfficer,
  getOfficers,
  getDepartments,
  deleteOfficer,
} = require('../controllers/adminController'); 

const {
  protect,
  adminOnly,
} = require('../middlewares/authMiddleware');


// ==========================================
// OFFICER MANAGEMENT
// ==========================================

// Create officer
router.post(
  '/officers',
  protect,
  adminOnly,
  createOfficer
);


// Get all officers
router.get(
  '/officers',
  protect,
  adminOnly,
  getOfficers
);


// Delete officer
router.delete(
  '/officers/:id',
  protect,
  adminOnly,
  deleteOfficer
);


// ==========================================
// DEPARTMENT MANAGEMENT
// ==========================================

// Get all departments
router.get(
  '/departments',
  protect,
  adminOnly,
  getDepartments
);


module.exports = router;