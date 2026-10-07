const express = require("express");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");
const { protect } = require("../middleware/auth");

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

router.post("/register", async (req, res) => {
  try {
    const { ownerName, shopName, username, password, phone, city, locality, category, description, upiId } = req.body;
    const exists = await Seller.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username already taken" });
    const seller = await Seller.create({ ownerName, shopName, username, password, phone, city, locality, category, description, upiId });
    res.status(201).json({ token: signToken(seller._id), seller: { ...seller.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const seller = await Seller.findOne({ username });
    if (!seller || !(await seller.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    res.json({ token: signToken(seller._id), seller: { ...seller.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, (req, res) => {
  res.json(req.seller);
});

module.exports = router;
