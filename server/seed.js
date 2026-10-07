const mongoose = require("mongoose");
const Seller = require("./models/Seller");
const Order = require("./models/Order");
require("dotenv").config();

const sellers = [
  {
    ownerName: "Priya Sharma",
    shopName: "Priyas Kitchen",
    username: "priya_kitchen",
    password: "priya123",
    phone: "9876543210",
    city: "Mumbai",
    locality: "Andheri West",
    category: "food",
    description: "Home-cooked North Indian meals, tiffin service and festive sweets. Made fresh every morning.",
    upiId: "priya.kitchen@upi",
    verified: true,
    rating: 4.8,
    reviewCount: 134,
    products: [
      { name: "Lunch Tiffin", price: 120, unit: "per box" },
      { name: "Rajma Chawal", price: 90, unit: "per plate" },
      { name: "Motichoor Ladoo", price: 250, unit: "per kg" }
    ],
    reviews: [
      { user: "Anjali M.", rating: 5, text: "Best tiffin in the area!" },
      { user: "Ritu S.", rating: 5, text: "Rajma is just like home." }
    ]
  },
  {
    ownerName: "Meera Patel",
    shopName: "Handmade by Meera",
    username: "meera_crafts",
    password: "meera123",
    phone: "9812345678",
    city: "Ahmedabad",
    locality: "Navrangpura",
    category: "craft",
    description: "Handcrafted jewellery, fabric bags and home decor. Each piece is one of a kind.",
    upiId: "meera.crafts@upi",
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    products: [
      { name: "Fabric Tote Bag", price: 350, unit: "each" },
      { name: "Terracotta Earrings", price: 180, unit: "pair" },
      { name: "Macrame Wall Hanging", price: 650, unit: "each" }
    ],
    reviews: [
      { user: "Pooja K.", rating: 5, text: "Beautiful quality pieces." },
      { user: "Neha R.", rating: 4, text: "Loved the earrings!" }
    ]
  },
  {
    ownerName: "Nisha Verma",
    shopName: "Nishas Glow Studio",
    username: "nisha_glow",
    password: "nisha123",
    phone: "9923456789",
    city: "Bangalore",
    locality: "Koramangala",
    category: "beauty",
    description: "Natural skincare made from herbs and essential oils. No chemicals, only care.",
    upiId: "nisha.glow@upi",
    verified: true,
    rating: 4.9,
    reviewCount: 202,
    products: [
      { name: "Rose Face Serum", price: 480, unit: "30ml" },
      { name: "Ubtan Body Scrub", price: 220, unit: "100g" },
      { name: "Herbal Hair Oil", price: 320, unit: "100ml" }
    ],
    reviews: [
      { user: "Kavita L.", rating: 5, text: "My skin has transformed!" },
      { user: "Swati P.", rating: 5, text: "Pure and effective." }
    ]
  },
  {
    ownerName: "Kavita Singh",
    shopName: "Kavita Boutique",
    username: "kavita_boutique",
    password: "kavita123",
    phone: "9934567890",
    city: "Jaipur",
    locality: "Civil Lines",
    category: "fashion",
    description: "Custom stitched ethnic wear - salwar kameez, blouses and lehengas. Tailored to your fit.",
    upiId: "kavita.boutique@upi",
    verified: false,
    rating: 4.4,
    reviewCount: 56,
    products: [
      { name: "Custom Salwar Kameez", price: 1200, unit: "per set" },
      { name: "Blouse Stitching", price: 400, unit: "each" },
      { name: "Dupatta Embroidery", price: 600, unit: "each" }
    ],
    reviews: [
      { user: "Divya M.", rating: 4, text: "Perfect fitting." }
    ]
  },
  {
    ownerName: "Anita Reddy",
    shopName: "Sweet Crumbs Bakery",
    username: "anita_bakery",
    password: "anita123",
    phone: "9845678901",
    city: "Hyderabad",
    locality: "Banjara Hills",
    category: "bakery",
    description: "Fresh-baked cakes, cookies and pastries. Custom birthday cakes with 48hr notice.",
    upiId: "sweetcrumbs@upi",
    verified: true,
    rating: 4.7,
    reviewCount: 178,
    products: [
      { name: "Chocolate Truffle Cake", price: 850, unit: "500g" },
      { name: "Assorted Cookies Box", price: 380, unit: "12 pcs" },
      { name: "Red Velvet Cupcakes", price: 240, unit: "4 pcs" }
    ],
    reviews: [
      { user: "Ranjana T.", rating: 5, text: "Best cake ever!" },
      { user: "Shalini B.", rating: 5, text: "Custom cake was perfect." }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Seller.deleteMany({});
  await Order.deleteMany({});
  for (const s of sellers) {
    const seller = new Seller(s);
    await seller.save();
  }
  console.log("Seed complete");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
