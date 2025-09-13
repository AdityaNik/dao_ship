const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { walletAddress, username, email, profileImage, bio } = req.body;

    const user = new User({
      walletAddress,
      username,
      email,
      profileImage,
      bio,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by wallet address
router.get("/wallet/:walletAddress", async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.params.walletAddress })
      .populate("joinedDAOs", "name description")
      .populate("createdDAOs", "name description");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/:id", async (req, res) => {
  try {
    const { username, email, profileImage, bio } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;
    user.bio = bio || user.bio;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's DAOs
router.get("/:id/daos", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("joinedDAOs", "name description contractAddress")
      .populate("createdDAOs", "name description contractAddress");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      joinedDAOs: user.joinedDAOs,
      createdDAOs: user.createdDAOs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
