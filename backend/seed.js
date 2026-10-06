const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hyperlocal');

    console.log('MongoDB Connected for Seeding');

    const adminEmail = 'admin@hyperlocal.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
    });

    console.log('Admin user seeded successfully');

    // Create a default department
    const deptExists = await Department.findOne({ name: 'General Public Works' });
    if (!deptExists) {
        await Department.create({
            name: 'General Public Works',
            description: 'Handles general city infrastructure issues.'
        });
        console.log('Default department created.');
    }

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAdmin();
