 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.deleteOne({ username: 'admin' });
  await User.create({
    username: 'admin',
    password: hash,
    role: 'admin',
    permissions: { canEdit: true, canDelete: true, viewDashboard: true }
  });
  console.log('Admin created!');
  process.exit();
});