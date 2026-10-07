const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { sellerId, buyerName, buyerPhone, items, note } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: "No items in order" });
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const order = await Order.create({ seller: sellerId, buyerName, buyerPhone, items, total, note: note || "" });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/buyer/:phone", async (req, res) => {
  try {
    const orders = await Order.find({ buyerPhone: req.params.phone }).populate("seller", "shopName upiId").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/seller", protect, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.seller._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.seller.toString() !== req.seller._id.toString()) return res.status(403).json({ message: "Forbidden" });
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/pay", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "accepted") return res.status(400).json({ message: "Order not accepted yet" });
    order.status = "payment_done";
    order.paymentDone = true;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
