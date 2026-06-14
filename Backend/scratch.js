const mongoose = require('mongoose');
const MenuItem = require('./src/models/menuItem.model');
const connectDB = require('./src/config/db');

connectDB().then(async () => {
  await MenuItem.updateMany({}, { $set: { stock: 100 } });
  console.log('Stock updated!');
  process.exit(0);
});
