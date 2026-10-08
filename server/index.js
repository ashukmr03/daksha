const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/sellers", require("./routes/sellers"));
app.use("/api/orders", require("./routes/orders"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

async function seedIfEmpty() {
  const Seller = require("./models/Seller");
  const count = await Seller.countDocuments();
  if (count === 0) {
    console.log("Database is empty. Auto-seeding initial seller data...");
    const { seedData } = require("./seed");
    if (seedData) {
      await seedData();
    }
  }
}

async function startServer() {
  const PORT = process.env.PORT || 5000;
  let mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/sakhi";

  try {
    console.log("Connecting to MongoDB at " + mongoUri + "...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    console.log("Connected to MongoDB at " + mongoUri);
  } catch (err) {
    console.warn("Could not connect to external MongoDB (" + err.message + "). Starting in-memory MongoDB server...");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log("Connected to in-memory MongoDB at " + mongoUri);
  }

  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => console.error("Server startup error:", err));

