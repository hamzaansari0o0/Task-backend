const { generateAccessToken, generateRefreshToken } = require("../utils/token");

exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    // ✅ JWT tokens generate karo
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // DB me refresh token save
    user.refreshToken = refreshToken;
    await user.save();

    // ✅ Access token ko cookie me daalo
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // production me true
      sameSite: "strict",
      maxAge: 3 * 60 * 1000, // 15 min
    });

    // ✅ Refresh token ko bhi cookie me daalo
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 din
    });

    // ✅ Frontend ko sirf role & id bhejna (token URL me mat bhejna)
    res.redirect(
      `http://localhost:5173/google-success?id=${user._id}&email=${user.email}&role=${user.role}`
    );

  } catch (error) {
    console.error("Google login failed ❌", error);
    res.redirect("http://localhost:5173/login?error=google_failed");
  }
};
