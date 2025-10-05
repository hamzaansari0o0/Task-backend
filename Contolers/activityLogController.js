const ActivityLog = require("../Models/activityLog");

// Get all logs (Admin only)
const getAllActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("userId", "name email role") // user ka data dikhane ke liye
      .sort({ createdAt: -1 }); // latest logs pehle

    res.status(200).json({
      message: "Activity logs fetched successfully ✅",
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity logs ❌", error: error.message });
  }
};

module.exports = { getAllActivityLogs };
