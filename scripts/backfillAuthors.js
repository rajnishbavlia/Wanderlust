const mongoose = require('mongoose');
const Listing = require('../models/listing');
const User = require('../models/user');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

(async function run(){
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Mongo connected');

    const username = process.argv[2];
    let user;
    if (username) {
      user = await User.findOne({ username });
      if (!user) {
        console.error(`User '${username}' not found`);
        process.exit(1);
      }
    } else {
      user = await User.findOne();
      if (!user) {
        console.error('No users found. Please sign up a user first.');
        process.exit(1);
      }
      console.log(`No username provided; using first user: ${user.username}`);
    }

    const result = await Listing.updateMany(
      { $or: [ { author: { $exists: false } }, { author: null } ] },
      { $set: { author: user._id } }
    );

    const modified = result.modifiedCount ?? result.nModified ?? 0;
    const matched = result.matchedCount ?? result.n ?? 0;
    console.log(`Matched: ${matched}, Updated: ${modified} listings to author '${user.username}'`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  }
})();
