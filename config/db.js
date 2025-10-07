
// config/db.js
const mongoose = require("mongoose");

// Cached connection object
let cachedConnection = null;

const connectDB = async () => {
  // Agar connection pehle se mojood hai, to usay istemal karein
  if (cachedConnection) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Naya connection banayein
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ New MongoDB Connected: ${conn.connection.host}`);
    
    // Naye connection ko cache mein save karein
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;