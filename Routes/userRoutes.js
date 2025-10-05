const express = require("express");
const passport = require("passport");

const {
  signupUser,
  loginUser,
  logoutUser,
  getProfile,
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken
} = require("../Contolers/userController");

const { googleCallback } = require("../Contolers/googleAuthController");
const { requestOtp, verifyOtp } = require("../Contolers/otpController");
const { authMiddleware, } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");


const router = express.Router();

// 📌 Public routes
// router.post("/signup", signupUser);
router.post("/signup", upload.single("profilePicture"), signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify/:token", verifyEmail);


// 📌 Forgot/Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 📌 Token refresh
router.post("/refresh", refreshAccessToken);

// 📌 Protected routes
router.get("/profile", authMiddleware, getProfile);
// router.put("/update", authMiddleware, updateUserProfile);
router.put("/update", authMiddleware, upload.single("profilePicture"), updateUserProfile);


// 📌 Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"],prompt: "select_account", })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }), // 👈 failureRedirect add kiya
  googleCallback
);

// OTP based login
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
