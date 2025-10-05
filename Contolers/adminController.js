const User = require("../Models/userModel");
const ActivityLog = require("../Models/activityLog");
const { logActivity } = require("../middlewares/activityLogger");

// Get All Users (Admin only)
// ✅ Get All Users with Pagination & Search
const getAllUsers = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page) || 1; // default page = 1
    const limit = parseInt(req.query.limit) || 10; // default limit = 10
    const search = req.query.search || ""; // default = empty

    const skip = (page - 1) * limit;

    // 🔍 Search filter
    const searchFilter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Total count (for pagination metadata)
    const totalUsers = await User.countDocuments(searchFilter);

    // Users fetch karo
    const users = await User.find(searchFilter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 }) // latest users first
      .skip(skip)
      .limit(limit);

    // 🔹 Log Activity
    // ✅ Use helper instead of direct ActivityLog.create
    await logActivity(req, req.user.id, "Viewed All Users", req.user.email);

    res.status(200).json({
      message: "Users fetched successfully ✅",
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error ❌", error: error.message });
  }
};

// Delete user by ID (Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found ❌" });

    await logActivity(
      req,
      req.user.id,
      `Deleted user ${deletedUser.email}`,
      req.user.email
    );

    res
      .status(200)
      .json({ message: "User deleted successfully ✅", deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role ❌" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    await logActivity(
      req,
      req.user.id,
      `Updated role of ${user.email} to ${role}`,
      req.user.email
    );

    res
      .status(200)
      .json({ message: "User role updated successfully ✅", user });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUserRole };
