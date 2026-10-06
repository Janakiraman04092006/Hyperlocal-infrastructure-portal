const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const {
  sendOfficerOTP
} = require('../utils/emailService');


// ==========================================
// GENERATE SECURE 6-DIGIT OTP
// ==========================================

const generateOTP = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};


// ==========================================
// CREATE OFFICER ACCOUNT
// ADMIN ONLY
// ==========================================

const createOfficer = async (req, res) => {

  try {

    const {
      name,
      email,
      employeeId,
      phone,
      department
    } = req.body;


    // ======================================
    // VALIDATION
    // ======================================

    if (
      !name ||
      !email ||
      !employeeId ||
      !department
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Name, email, employee ID and department are required.'
      });

    }


    // ======================================
    // NORMALIZE DATA
    // ======================================

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedEmployeeId =
      employeeId.trim().toUpperCase();


    // ======================================
    // VALIDATE DEPARTMENT ID
    // ======================================

    if (
      !mongoose.Types.ObjectId.isValid(
        department
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Invalid department selected.'
      });

    }


    // ======================================
    // CHECK EXISTING EMAIL
    // ======================================

    const existingEmail =
      await User.findOne({
        email: normalizedEmail
      });

    if (existingEmail) {

      return res.status(409).json({
        success: false,
        message:
          'An account with this email already exists.'
      });

    }


    // ======================================
    // CHECK EXISTING EMPLOYEE ID
    // ======================================

    const existingEmployee =
      await User.findOne({
        employeeId:
          normalizedEmployeeId
      });

    if (existingEmployee) {

      return res.status(409).json({
        success: false,
        message:
          'This employee ID is already registered.'
      });

    }


    // ======================================
    // FIND DEPARTMENT
    // ======================================

    const departmentExists =
      await Department.findById(
        department
      );

    if (!departmentExists) {

      return res.status(404).json({
        success: false,
        message:
          'Selected department does not exist.'
      });

    }


    // ======================================
    // GENERATE TEMPORARY PASSWORD
    // ======================================

    const temporaryPassword =
      crypto
        .randomBytes(12)
        .toString('base64url');


    // ======================================
    // HASH PASSWORD
    // ======================================

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        12
      );


    // ======================================
    // GENERATE OTP
    // ======================================

    const otp =
      generateOTP();


    // ======================================
    // HASH OTP
    // ======================================

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );


    // ======================================
    // OTP EXPIRY
    // 5 MINUTES
    // ======================================

    const otpExpiresAt =
      new Date(
        Date.now() +
        5 * 60 * 1000
      );


    // ======================================
    // CREATE OFFICER
    // ======================================

    const officer =
      await User.create({

        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          'Officer',

        employeeId:
          normalizedEmployeeId,

        phone:
          phone
            ? phone.trim()
            : null,

        department:
          department,

        isActive:
          true,

        isVerified:
          false,

        mustChangePassword:
          true,

        otpHash:
          otpHash,

        otpExpiresAt:
          otpExpiresAt,

        otpAttempts:
          0,

        lastOtpSentAt:
          new Date()

      });


    // ======================================
    // SEND OTP EMAIL
    // ======================================

    try {

      await sendOfficerOTP({

        name:
          officer.name,

        email:
          officer.email,

        otp:
          otp

      });

    } catch (emailError) {

      console.error(
        'Officer OTP email error:',
        emailError.message
      );


      // ====================================
      // DELETE OFFICER IF EMAIL FAILS
      // ====================================

      await User.findByIdAndDelete(
        officer._id
      );


      return res.status(500).json({

        success: false,

        message:
          'Officer account could not be created because the verification email could not be sent.'

      });

    }


    // ======================================
    // SUCCESS RESPONSE
    // ======================================

    return res.status(201).json({

      success: true,

      message:
        'Officer account created successfully. Verification OTP has been sent to the officer email.',


      // ====================================
      // OFFICER INFORMATION
      // ====================================

      officer: {

        id:
          officer._id,

        name:
          officer.name,

        email:
          officer.email,

        employeeId:
          officer.employeeId,

        phone:
          officer.phone,

        role:
          officer.role,

        department:
          departmentExists.name,

        isActive:
          officer.isActive,

        isVerified:
          officer.isVerified,

        mustChangePassword:
          officer.mustChangePassword

      },


      // ====================================
      // DEVELOPMENT INFORMATION
      // ====================================
      //
      // IMPORTANT:
      // This exposes the temporary password
      // only for your project/testing.
      //
      // Do NOT expose passwords this way
      // in a real production application.
      // ====================================

      temporaryPassword:
        temporaryPassword

    });

  } catch (error) {

    console.error(
      'Create Officer Error:',
      error
    );


    // ======================================
    // DUPLICATE KEY ERROR
    // ======================================

    if (error.code === 11000) {

      return res.status(409).json({

        success: false,

        message:
          'Email or employee ID already exists.'

      });

    }


    // ======================================
    // GENERAL ERROR
    // ======================================

    return res.status(500).json({

      success: false,

      message:
        'Unable to create officer account.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined

    });

  }

};


// ==========================================
// GET ALL OFFICERS
// ADMIN ONLY
// ==========================================

const getOfficers = async (req, res) => {

  try {

    const officers =
      await User.find({
        role: 'Officer'
      })

        .select(
          '-password -otpHash -loginOtpHash'
        )

        .populate(
          'department',
          'name description'
        )

        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      success: true,

      count:
        officers.length,

      officers:
        officers

    });

  } catch (error) {

    console.error(
      'Get Officers Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Unable to fetch officers.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined

    });

  }

};


// ==========================================
// GET ALL DEPARTMENTS
// ADMIN ONLY
// ==========================================

const getDepartments = async (req, res) => {

  try {

    const departments =
      await Department.find()

        .select(
          '_id name description'
        )

        .sort({
          name: 1
        });


    return res.status(200).json({

      success: true,

      count:
        departments.length,

      departments:
        departments

    });

  } catch (error) {

    console.error(
      'Get Departments Error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Unable to fetch departments.',

      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined

    });

  }

};

// ==========================================
// DELETE OFFICER
// ADMIN ONLY
// ==========================================

const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer ID.',
      });
    }

    // Find only Officer accounts
    const officer = await User.findOne({
      _id: id,
      role: 'Officer',
    });

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: 'Officer not found.',
      });
    }

    // Delete officer
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Officer deleted successfully.',
    });

  } catch (error) {
    console.error('Delete Officer Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete officer.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
};
// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createOfficer,
  getOfficers,
  getDepartments,
  deleteOfficer
};