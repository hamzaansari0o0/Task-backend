//authMiddleware.js file:
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel"); // apna user model

// ✅ Access Token verify middleware
// ✅ Access Token verify middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.accessToken; // cookie se token lo
    if (!token) {
      return res.status(401).json({ message: "Access token missing ❌" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired access token ❌" });
      }

      req.user = decoded; 
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};


module.exports = { authMiddleware, };
