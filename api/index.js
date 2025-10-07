// backend/api/index.js

const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require('../config/cloudinary'); // ✅ Cloudinary config ko server start par load karein

const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const connectDB = require("../config/db");
require("../config/passport");

const userRoutes = require("../Routes/userRoutes");
const adminRoutes = require("../Routes/adminRoutes");
const taskRoutes = require("../Routes/taskRoutes");
const app = express();

// Database Connection Middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// CORS Configuration
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL, // ✅ Apne Vercel frontend URL ke liye
      "http://localhost:5173",  // ✅ Local development ke liye
      // "https://your-frontend-project.vercel.app" // Aap yahan direct URL bhi daal sakte hain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security Middlewares
app.use(helmet());
app.use(passport.initialize());
app.use(mongoSanitize());
app.use(xss());

// Welcome Route
app.get("/", (req, res) => {
  res.send("Welcome to the Task API! Server is running. 🚀");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);

// Export the app for Vercel
module.exports = app;