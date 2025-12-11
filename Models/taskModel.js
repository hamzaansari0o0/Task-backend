// const mongoose = require("mongoose");

// const taskSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     status: {
//       type: String,
//       enum: ["Pending", "Complete"],
//       default: "Pending",
//     },
//     deadline: {
//       type: Date,
//     },
//     // Yeh sab se zaroori field hai. Yeh task ko user se jodega.
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       ref: "User", // 'User' model se reference
//     },
//   },
//   { timestamps: true }
// );

// const Task = mongoose.model("Task", taskSchema);

// module.exports = Task;
///////////////////////////////////////////////////////////

// backend/Models/taskModel.js
// backend/Models/taskModel.js

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Complete"],
      default: "Pending",
    },
    deadline: {
      type: Date,
    },
    // ✅ File ka URL aur Public ID save karne ke liye
  fileUrl: {
      type: String,
      default: null,
    },
    filePublicId: {
      type: String,
      default: null,
    },
    // ✅ YEH NAYI FIELD ADD KAREIN
    originalFilename: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;

