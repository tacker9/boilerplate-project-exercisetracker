const mongoose = require("mongoose");
require("dotenv").config();

try {
  mongoose.connect(process.env.MONGODB_URI);
  console.log("Successfully connected to MongoDB!");
} catch (err) {
  console.log(err);
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = { User, Exercise };
