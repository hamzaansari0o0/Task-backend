// userModel.js file
const mongoose = require("mongoose");

// schema define karo
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    refreshToken: {
      // <-- ye naya field add karte hain
      type: String,
      default: null,
    },
    role: {
      // ✅ Role field add
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false, // by default user unverified hoga
    },
    isDeleted: {
      // ✅ Soft delete flag add
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: null, // pehle default null hoga
    },
  },
  { timestamps: true }
); // createdAt, updatedAt add karega auto

// model create karo
const User = mongoose.model("User", userSchema);

module.exports = User; // <-- yahan default export CommonJS me
