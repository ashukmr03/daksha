const express = require("express");
const Seller = require("../models/Seller");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, city, q, verified } = req.query;
    let filter = {};
    if (category && category !== "all") filter.category = category;
    if (city && city !== "all") filter.city = city;
    if (verified === "true") filter.verified = true;
    if (q) {
      filter.$or = [
        { shopName: { $regex: q, $options: "i" } },
        { locality: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "products.name": { $regex: q, $options: "i" } }
      ];
    }
    const sellers = await Seller.find(filter).select("-password");
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/cities", async (req, res) => {
  try {
    const cities = await Seller.distinct("city");
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/products", protect, async (req, res) => {
  try {
    if (req.seller._id.toString() !== req.params.id) return res.status(403).json({ message: "Forbidden" });
    const { name, price, unit } = req.body;
    const seller = await Seller.findById(req.params.id);
    seller.products.push({ name, price: Number(price), unit: unit || "each" });
    await seller.save();
    res.status(201).json(seller.products[seller.products.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/products/:productId", protect, async (req, res) => {
  try {
    if (req.seller._id.toString() !== req.params.id) return res.status(403).json({ message: "Forbidden" });
    const seller = await Seller.findById(req.params.id);
    seller.products = seller.products.filter(p => p._id.toString() !== req.params.productId);
    await seller.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
