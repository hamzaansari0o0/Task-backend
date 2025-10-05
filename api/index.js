// api/index.js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const connectDB = require("../config/db"); // 👈 Path update kiya
require("../config/passport"); // 👈 Path update kiya

const userRoutes = require("../Routes/userRoutes"); // 👈 Path update kiya
const adminRoutes = require("../Routes/adminRoutes"); // 👈 Path update kiya

const app = express();

// ✅ Database Connection Middleware
// Har request se pehle database connection check karega
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ✅ CORS ko Vercel ke liye configure karein
// Frontend URL ko environment variable se lein
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Security middlewares
app.use(helmet());
app.use(passport.initialize());
app.use(mongoSanitize());
app.use(xss());

// ✅ Static uploads (Vercel par aam taur par alag service se handle hota hai)
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ❗️ app.listen() ko hata diya gaya hai
// Vercel server ko khud manage karta hai, isliye iski zaroorat nahi.

// Vercel ke liye app ko export karein
module.exports = app;