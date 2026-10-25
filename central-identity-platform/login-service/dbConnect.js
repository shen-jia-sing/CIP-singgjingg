const mongoose = require("mongoose");

const dbConnect = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully");
};

module.exports = dbConnect;
