const User = require("../Models/userModel");
const ActivityLog = require("../Models/activityLog");
const { logActivity } = require("../middlewares/activityLogger");

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchFilter = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const totalUsers = await User.countDocuments(searchFilter);

    const users = await User.find(searchFilter)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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