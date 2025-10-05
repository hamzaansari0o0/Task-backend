const { generateAccessToken, generateRefreshToken } = require("../utils/token");

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Access token ko cookie me daalo
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // 👈 CHANGE HERE
      maxAge: 3 * 60 * 1000,
    });

    // Refresh token ko bhi cookie me daalo
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // 👈 CHANGE HERE
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Frontend URL ab environment variable se aayega
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(
      `${frontendUrl}/google-success?id=${user._id}&email=${user.email}&role=${user.role}`
    );

  } catch (error) {
    console.error("Google login failed ❌", error);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/login?error=google_failed`);
  }
};