const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    // required: true,
    // unique: true,
  },
  username: {
    type: String,
    // required: true,
    // unique: true,
  },
  email: {
    type: String,
    // required: true,
    // unique: true,
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
  },
  joinedDAOs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DAO",
    },
  ],
  createdDAOs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DAO",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
