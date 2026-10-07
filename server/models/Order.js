const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  note: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "accepted", "payment_done", "delivered", "cancelled"],
    default: "pending"
  },
  paymentDone: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
