const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "gnr_admin_hub", // ⭐ IMPORTANT — forces correct Atlas DB
    });

    console.log("✅ MongoDB Connected Successfully:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
