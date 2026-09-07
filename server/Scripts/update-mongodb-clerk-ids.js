import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import User from "../models/User.js";

const results = JSON.parse(
  fs.readFileSync("./clerk-migration-results.json", "utf8")
);

try {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("✅ Connected to MongoDB");
  console.log("Database:", mongoose.connection.name);
console.log("Users in database:", await User.countDocuments());

const testUser = await User.findOne({
  email: "navaneethsiliveriyt@gmail.com",
}).lean();

console.log("Test user:", testUser);

  for (const result of results) {
    if (!result.success) {
      console.log(`⏭️ Skipping: ${result.email}`);
      continue;
    }

    const oldId = result.oldClerkId;
    const newId = result.newClerkId;

    const oldUser = await User.findOne({
  email: result.email,
}).lean();

    if (!oldUser) {
      console.log(`⚠️ User not found in MongoDB: ${result.email}`);
      continue;
    }

    // Check whether the new Clerk ID already exists in MongoDB
    const existingNewUser = await User.findById(newId).lean();

    if (existingNewUser) {
      console.log(`⚠️ New ID already exists: ${result.email}`);
      continue;
    }

    // Create a new MongoDB document with the NEW Clerk ID.
    // All existing user data is preserved.
    const newUser = {
      ...oldUser,
      _id: newId,
    };

    await User.create(newUser);

    // Delete the old MongoDB document only after the new one succeeds.
    await User.deleteOne({ _id: oldUser._id });

    console.log(`✅ Updated: ${result.email}`);
  }

  console.log("\n🎉 MongoDB migration completed!");
} catch (error) {
  console.error("❌ Migration failed:", error);
} finally {
  await mongoose.disconnect();
}