const ActivityLog = require( "../Models/activityLog");

const logActivity = async (req, userId, action) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("❌ Activity log error:", error.message);
  }
};
module.exports= {logActivity};