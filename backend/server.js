const dotenv = require('dotenv');

// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================

dotenv.config();


// ==========================================
// IMPORT PACKAGES
// ==========================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');


// ==========================================
// IMPORT MODELS
// ==========================================

const User = require('./models/User');
const Department = require('./models/Department');


// ==========================================
// IMPORT EMAIL SERVICE
// ==========================================

const {
  verifyEmailConnection
} = require('./utils/emailService');


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;


// ==========================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================

console.log('');
console.log('==========================================');
console.log('ENVIRONMENT CONFIGURATION');
console.log('==========================================');

console.log(
  'MongoDB:',
  process.env.MONGO_URI ? 'LOADED' : 'MISSING'
);

console.log(
  'JWT Secret:',
  process.env.JWT_SECRET ? 'LOADED' : 'MISSING'
);

console.log(
  'Email Host:',
  process.env.EMAIL_HOST || 'MISSING'
);

console.log(
  'Email Port:',
  process.env.EMAIL_PORT || 'MISSING'
);

console.log(
  'Email User:',
  process.env.EMAIL_USER ? 'LOADED' : 'MISSING'
);

console.log(
  'Email Password:',
  process.env.EMAIL_PASSWORD ? 'LOADED' : 'MISSING'
);

console.log(
  'Email From:',
  process.env.EMAIL_FROM || 'MISSING'
);

console.log('==========================================');
console.log('');


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);


// ==========================================
// SERVE UPLOADED IMAGES
// ==========================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);


// ==========================================
// SEED DEPARTMENT + ADMIN
// ==========================================

const seedAdmin = async () => {

  try {

    // --------------------------------------
    // CREATE / FIND DEFAULT DEPARTMENT
    // --------------------------------------

    let department =
      await Department.findOne({
        name: 'General Public Works'
      });


    if (!department) {

      department =
        await Department.create({

          name:
            'General Public Works',

          description:
            'Handles general city infrastructure issues.'

        });


      console.log(
        'Default department created.'
      );

    } else {

      console.log(
        'Default department already exists.'
      );

    }


    // --------------------------------------
    // CREATE / FIND ADMIN
    // --------------------------------------

    const adminEmail =
      'admin@hyperlocal.com';


    const adminExists =
      await User.findOne({
        email: adminEmail
      });


    if (!adminExists) {

      const salt =
        await bcrypt.genSalt(10);


      const hashedPassword =
        await bcrypt.hash(
          'admin123',
          salt
        );


      await User.create({

        name:
          'System Admin',

        email:
          adminEmail,

        password:
          hashedPassword,

        role:
          'Admin',

        department:
          department._id,

        isActive:
          true,

        isVerified:
          true,

        mustChangePassword:
          false

      });


      console.log('');
      console.log(
        'Admin user seeded automatically.'
      );

      console.log(
        'Admin Email: admin@hyperlocal.com'
      );

      console.log(
        'Admin Password: admin123'
      );

      console.log('');

    } else {

      console.log(
        'Admin user already exists.'
      );

    }

  } catch (error) {

    console.error(
      'Seed error:',
      error.message
    );

  }

};


// ==========================================
// MONGODB CONNECTION
// ==========================================

const connectDB = async () => {

  try {

    const mongoUri =
      process.env.MONGO_URI;


    if (!mongoUri) {

      throw new Error(
        'MONGO_URI is not defined in .env'
      );

    }


    console.log('');
    console.log(
      'Connecting to MongoDB Atlas...'
    );


    await mongoose.connect(
      mongoUri
    );


    console.log(
      'Connected to MongoDB Atlas successfully'
    );


    // --------------------------------------
    // SEED DEFAULT DATA
    // --------------------------------------

    await seedAdmin();


  } catch (error) {

    console.error('');
    console.error(
      'MongoDB connection error:',
      error.message
    );

    console.error('');
    console.error(
      'MongoDB connection failed.'
    );

  }

};


// ==========================================
// MONGOOSE CONNECTION EVENTS
// ==========================================

mongoose.connection.on(
  'connected',
  () => {

    console.log(
      'Mongoose connection established.'
    );

  }
);


mongoose.connection.on(
  'error',
  (error) => {

    console.error(
      'MongoDB runtime error:',
      error.message
    );

  }
);


mongoose.connection.on(
  'disconnected',
  () => {

    console.log(
      'MongoDB disconnected.'
    );

  }
);


// ==========================================
// API ROUTES
// ==========================================


// ------------------------------------------
// AUTHENTICATION
// ------------------------------------------

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);


// ------------------------------------------
// ADMIN
// ------------------------------------------

app.use(
  '/api/admin',
  require('./routes/adminRoutes')
);


// ------------------------------------------
// ISSUES
// ------------------------------------------

app.use(
  '/api/issues',
  require('./routes/issueRoutes')
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  '/api/health',
  (req, res) => {

    const databaseConnected =
      mongoose.connection.readyState === 1;


    const emailConfigured =
      Boolean(
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD &&
        process.env.EMAIL_FROM
      );


    res.status(200).json({

      success:
        true,

      status:
        'ok',

      message:
        'Hyperlocal API is running',

      database:
        databaseConnected
          ? 'connected'
          : 'disconnected',

      emailService:
        emailConfigured
          ? 'configured'
          : 'not configured'

    });

  }
);


// ==========================================
// ROOT API
// ==========================================

app.get(
  '/',
  (req, res) => {

    res.status(200).json({

      success:
        true,

      message:
        'Hyperlocal Public Infrastructure Portal API',

      server:
        'running',

      port:
        PORT

    });

  }
);


// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {

    res.status(404).json({

      success:
        false,

      message:
        `Route not found: ${req.method} ${req.originalUrl}`

    });

  }
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {

    console.error('');
    console.error(
      '=========================================='
    );

    console.error(
      'SERVER ERROR'
    );

    console.error(
      '=========================================='
    );

    console.error(
      err
    );


    res.status(500).json({

      success:
        false,

      message:
        'Something went wrong!',

      error:
        process.env.NODE_ENV === 'development'
          ? err.message
          : undefined

    });

  }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
  PORT,
  async () => {

    console.log('');
    console.log(
      '=========================================='
    );

    console.log(
      `Server is running on port ${PORT}`
    );

    console.log(
      '=========================================='
    );

    console.log('');

    console.log(
      'Connecting to Brevo SMTP...'
    );


    // --------------------------------------
    // VERIFY EMAIL SERVICE
    // --------------------------------------

    await verifyEmailConnection();

  }
);


// ==========================================
// CONNECT TO MONGODB
// ==========================================
//
// IMPORTANT:
// This was missing in your previous code.
// Without this line MongoDB will never connect.
//

connectDB();


// ==========================================
// HANDLE UNHANDLED PROMISE REJECTIONS
// ==========================================

process.on(
  'unhandledRejection',
  (error) => {

    console.error('');
    console.error(
      'Unhandled Promise Rejection:'
    );

    console.error(
      error
    );

  }
);


// ==========================================
// HANDLE UNCAUGHT EXCEPTIONS
// ==========================================

process.on(
  'uncaughtException',
  (error) => {

    console.error('');
    console.error(
      'Uncaught Exception:'
    );

    console.error(
      error
    );

  }
);