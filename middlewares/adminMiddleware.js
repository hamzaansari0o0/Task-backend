// Middleware: allow only admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only ❌" });
  }
  next();
};

module.exports = adminMiddleware;
