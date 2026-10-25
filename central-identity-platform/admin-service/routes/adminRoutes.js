const express = require("express");
const User = require("../models/User");

const router = express.Router();

// The gateway already verified the JWT; this double-checks the forwarded role.
router.use((req, res, next) => {
  if (req.headers["x-user-role"] !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
});

// GET /admin/viewalluser
router.get("/viewalluser", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /admin/searchuser?query=...   (matches name or email)
router.get("/searchuser", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "query is required" });

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const users = await User.find({
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ],
    }).select("-password");

    if (users.length === 0) return res.status(404).json({ message: "No user found" });
    return res.status(200).json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /admin/deluser   body: { email }
router.delete("/deluser", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const deleted = await User.findOneAndDelete({ email: email.toLowerCase() });
    if (!deleted) return res.status(404).json({ message: "No user found" });

    return res.status(200).json({ message: "User deleted successfully", email: deleted.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
