const mongoose = require('mongoose');
const User = require('../models/user');

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    const users = await User.find().select('username email role');
    console.log(JSON.stringify(users, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
