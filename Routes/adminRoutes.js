const express = require("express");
const { getAllUsers, deleteUser, updateUserRole } = require("../Contolers/adminController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { getAllActivityLogs } = require("../Contolers/activityLogController");

const router = express.Router();

// Admin routes (double protection ✅)
router.route("/users").get(authMiddleware, adminMiddleware, getAllUsers);
router.route("/users/:id").delete(authMiddleware, adminMiddleware, deleteUser);
router.route("/users/:id/role").put(authMiddleware, adminMiddleware, updateUserRole);

router.route("/activity/logs").get(authMiddleware, adminMiddleware, getAllActivityLogs);
module.exports = router;
