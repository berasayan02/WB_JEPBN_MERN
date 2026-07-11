// Promotes an existing user (by email) to the "admin" role so they can
// access the Admin Panel and manage subjects/questions.
//
// Usage:
//   node seed/makeAdmin.js someone@example.com
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node seed/makeAdmin.js <email>");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`${user.email} is now an admin.`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run();
