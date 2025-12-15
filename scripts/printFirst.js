const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

(async function(){
  try{
    console.log('Connecting to DB:', MONGO_URL);
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected. Querying a listing...');
    const listing = await Listing.findOne({});
    if(!listing){
      console.log('No listings found');
    } else {
      console.log('First listing (raw):');
      console.log(JSON.stringify(listing.toObject(), null, 2));
    }
  } catch(e){
    console.error('Error:', e);
  } finally {
    await mongoose.connection.close();
  }
})();
