// const express = require("express");
// const dotenv = require("dotenv");
// dotenv.config();
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
// const cookieParser = require("cookie-parser");
// const passport = require("passport");

// const connectDB = require("./config/db");
// require("./config/passport");

// const userRoutes = require("./Routes/userRoutes");
// const adminRoutes = require("./Routes/adminRoutes");

// connectDB();
// const app = express();

// // ✅ CORS sabse upar rakho
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

// // ✅ parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ✅ security middlewares
// app.use(helmet());
// app.use(passport.initialize());
// app.use(mongoSanitize());
// app.use(xss());

// // ✅ rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use(limiter);

// // ✅ static uploads
// app.use(
//   "/uploads",
//   (req, res, next) => {
//     res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//     next();
//   },
//   express.static("uploads")
// );

// // ✅ routes
// app.use("/api/users", userRoutes);
// app.use("/api/admin", adminRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`Server http://localhost:${PORT} pe chal raha hai 🚀`)
// );
