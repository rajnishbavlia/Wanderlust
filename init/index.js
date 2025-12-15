const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { init } = require("../models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  // Ensure seeded listings have an `author` field compatible with the model
  initData.data = initData.data.map((obj) => ({ ...obj, author: initData.userId }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();