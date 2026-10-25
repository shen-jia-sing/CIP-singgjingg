const express = require("express");
const User = require("../models/User");

const router = express.Router();

// The gateway already verified the JWT; this double-checks the forwarded identity.
router.use((req, res, next) => {
  if (req.headers["x-user-role"] !== "user") {
    return res.status(403).json({ message: "Forbidden: Users only" });
  }
  if (!req.headers["x-user-email"]) {
    return res.status(401).json({ message: "Missing identity header" });
  }
  next();
});

// GET /user/viewprofile
router.get("/viewprofile", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.headers["x-user-email"] }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /user/updateprofile   body: { name?, phone? }
router.put("/updateprofile", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name && !phone) {
      return res.status(400).json({ message: "Provide name and/or phone to update" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.headers["x-user-email"] },
      { $set: { ...(name && { name }), ...(phone && { phone }) } },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
