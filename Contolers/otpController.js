const OTP = require("../Models/otpModel");
const User = require("../Models/userModel");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const { sendOtpEmail } = require("../services/emailService");

// ✅ Step 1: OTP Request
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required ❌" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    // OTP generate
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // DB me save (purana OTP delete karke naya save)
    await OTP.deleteMany({ email });
    await OTP.create({ email, code, expiresAt });

    // Email send
    await sendOtpEmail(email, code);

    res.status(200).json({ message: "OTP sent to email 📩" });
  } catch (error) {
    res.status(500).json({ message: "Failed to request OTP ❌", error: error.message });
  }
};

// ✅ Step 2: OTP Verify
exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: "Email & OTP required ❌" });

    const otpDoc = await OTP.findOne({ email, code });
    if (!otpDoc) return res.status(400).json({ message: "Invalid OTP ❌" });

    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired ❌" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    // ✅ Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 3 * 60 * 1000, // 3 min
    });

    // ✅ Refresh token cookie (add this!)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    });

    // ✅ OTP delete kar do
    await OTP.deleteMany({ email });

    res.status(200).json({
      message: "OTP verified, login successful 🎉",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify OTP ❌", error: error.message });
  }
};
