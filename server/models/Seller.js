const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: "each" }
});

const reviewSchema = new mongoose.Schema({
  user: String,
  rating: { type: Number, min: 1, max: 5 },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const sellerSchema = new mongoose.Schema({
  ownerName: { type: String, required: true },
  shopName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  category: { type: String, required: true, enum: ["food", "bakery", "craft", "beauty", "fashion", "other"] },
  description: { type: String, required: true },
  upiId: { type: String, required: true },
  verified: { type: Boolean, default: false },
  products: [productSchema],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

sellerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

sellerSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("Seller", sellerSchema);
