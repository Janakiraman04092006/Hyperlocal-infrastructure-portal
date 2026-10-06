const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// ==========================================
// GENERATE JWT TOKEN
// ==========================================

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};


// ==========================================
// REGISTER CITIZEN
// ==========================================
// Public registration creates Citizen only.
// Officer/Admin cannot be created here.
// ==========================================

const registerUser = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!name || !email || !password) {

      return res.status(400).json({
        success: false,
        message:
          'Name, email and password are required.',
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters.',
      });

    }


    // ==========================================
    // NORMALIZE EMAIL
    // ==========================================

    const normalizedEmail =
      email.trim().toLowerCase();


    // ==========================================
    // CHECK EXISTING USER
    // ==========================================

    const userExists =
      await User.findOne({
        email: normalizedEmail,
      });


    if (userExists) {

      return res.status(409).json({
        success: false,
        message:
          'User already exists.',
      });

    }


    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );


    // ==========================================
    // CREATE CITIZEN
    // ==========================================

    const user =
      await User.create({

        name:
          name.trim(),

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          'Citizen',

        isActive:
          true,

        isVerified:
          true,

        mustChangePassword:
          false,

      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({

      success:
        true,

      _id:
        user._id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      token:
        generateToken(
          user._id
        ),

    });

  } catch (error) {

    console.error(
      'REGISTER ERROR:',
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Server error',

      error:
        error.message,

    });

  }
};


// ==========================================
// LOGIN USER
// ==========================================
// Citizen/Admin login currently uses
// email + password.
//
// Officer MFA will be added in the next step.
// ==========================================

const loginUser = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!email || !password) {

      return res.status(400).json({

        success:
          false,

        message:
          'Email and password are required.',

      });

    }


    // ==========================================
    // NORMALIZE EMAIL
    // ==========================================

    const normalizedEmail =
      email.trim().toLowerCase();


    // ==========================================
    // FIND USER
    // ==========================================

    const user =
      await User.findOne({
        email:
          normalizedEmail,
      });


    // ==========================================
    // USER NOT FOUND
    // ==========================================

    if (!user) {

      return res.status(401).json({

        success:
          false,

        message:
          'Invalid email or password.',

      });

    }


    // ==========================================
    // CHECK ACCOUNT STATUS
    // ==========================================

    if (user.isActive === false) {

      return res.status(403).json({

        success:
          false,

        message:
          'Your account has been deactivated. Please contact the administrator.',

      });

    }


    // ==========================================
    // CHECK PASSWORD
    // ==========================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!passwordMatch) {

      return res.status(401).json({

        success:
          false,

        message:
          'Invalid email or password.',

      });

    }


    // ==========================================
    // UPDATE LAST LOGIN
    // ==========================================

    user.lastLoginAt =
      new Date();

    await user.save();


    // ==========================================
    // GENERATE TOKEN
    // ==========================================

    const token =
      generateToken(
        user._id
      );


    // ==========================================
    // LOGIN SUCCESS
    // ==========================================

    return res.status(200).json({

      success:
        true,

      _id:
        user._id,

      name:
        user.name,

      email:
        user.email,

      role:
        user.role,

      token:
        token,

    });

  } catch (error) {

    console.error(
      'LOGIN ERROR:',
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Server error',

      error:
        error.message,

    });

  }
};


// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (req, res) => {

  try {

    const user =
      await User.findById(
        req.user.id
      )
        .select(
          '-password -otpHash -loginOtpHash'
        )
        .populate(
          'department'
        );


    if (!user) {

      return res.status(404).json({

        success:
          false,

        message:
          'User not found.',

      });

    }


    return res.status(200).json(
      user
    );

  } catch (error) {

    console.error(
      'GET ME ERROR:',
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Server error',

      error:
        error.message,

    });

  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

  registerUser,

  loginUser,

  getMe,

};