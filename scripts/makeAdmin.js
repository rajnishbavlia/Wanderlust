const mongoose = require('mongoose');
const User = require('../models/user');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

(async function run(){
  try {
    await mongoose.connect(MONGO_URL);
    const username = process.argv[2];
    if (!username) {
      console.error('Usage: node scripts/makeAdmin.js <username>');
      process.exit(1);
    }
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`User '${username}' not found`);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`User '${username}' is now admin.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
