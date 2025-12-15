const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const plm = passportLocalMongoose && passportLocalMongoose.default ? passportLocalMongoose.default : passportLocalMongoose;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);
