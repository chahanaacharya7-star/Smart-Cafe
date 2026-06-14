const User = require('../models/user.model');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@cafe.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@cafe.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('✅ Default admin user created automatically.');
    } else {
      console.log('✅ Default admin user already exists.');
    }
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
  }
};

module.exports = seedAdmin;
