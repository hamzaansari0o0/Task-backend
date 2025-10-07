const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary"); // ✅ Configured Cloudinary ko import karein
const {
  signupValidation,
  loginValidation,
} = require("../validators/userValidator");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");
const { logActivity } = require("../middlewares/activityLogger");



// Signup
const signupUser = async (req, res) => {
  const { error } = signupValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered ❌" });

    let profilePictureUrl = null;

    // ✅ Correct Cloudinary Upload Logic
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      profilePictureUrl = result.secure_url;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      profilePicture: profilePictureUrl,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await sendVerificationEmail(newUser, token);
    await logActivity(req, newUser._id, "User signed up", newUser.email);

    res.status(201).json({
      message: "User signup successful 🚀. Please check your email to verify.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed ❌", error: error.message });
  }
};

// Login
const loginUser = async (req, res) => {
  const { error } = loginValidation.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password ❌" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logActivity(req, user._id, "User logged in", user.email);

    res.status(200).json({
      message: "Login successful 🎉",
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed ❌", error: error.message });
  }
};

// Refresh Access Token
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token ❌" });

  try {
    const user = await User.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token ❌" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token expired ❌" });

        const newAccessToken = generateAccessToken(user);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 3 * 60 * 1000,
        });

        res.json({ message: "Access token refreshed ✅" });
      }
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Token refresh failed ❌", error: error.message });
  }
};

// Logout
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
            await logActivity(req, user._id, "User logged out", user.email);
        }
    }
    
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Logout successful ✅" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed ❌", error: error.message });
  }
};

// Get Profile (self)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    await logActivity(req, req.user.id, "Viewed profile", req.user.email);

    res.status(200).json({
      message: "Profile fetched successfully ✅",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};

// Update Profile (self)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    user.name = req.body.name || user.name;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // ✅ Correct Cloudinary Upload Logic for Update
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "profile_pics" },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      user.profilePicture = result.secure_url;
    }

    const updatedUser = await user.save();
    await logActivity(req, user._id, "Updated profile", user.email);

    res.json({
      message: "Profile updated successfully ✅",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};

// verifyEmail
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token ❌" });
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified ✅" });
    }

    user.isVerified = true;
    await user.save();
    await logActivity(req, user._id, "Verified email", user.email);
    
    const loginUrl = `${process.env.FRONTEND_URL}/signin?verified=true`;
    res.redirect(loginUrl);
    
  } catch (error) {
     const errorUrl = `${process.env.FRONTEND_URL}/signin?error=verification_failed`;
     res.redirect(errorUrl);
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    await sendPasswordResetEmail(user, token);
    await logActivity(req, user._id, "Requested password reset", user.email);

    res.status(200).json({ message: "Password reset link sent 📩" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending reset email ❌", error: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();
    await logActivity(req, user._id, "Reset password", user.email);

    res.status(200).json({ message: "Password reset successful 🎉" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid or expired token ❌", error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getProfile,
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
};