const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  uploadTaskFile,
} = require("../Contolers/taskController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const uploadPdf = require("../config/multer-pdf");
const router = express.Router();

// Yeh saare routes protected hain. Sirf logged-in user hi inhein access kar sakta hai.
router.use(authMiddleware);

router.route("/")
  .post(createTask) // Naya task banane ke liye (POST /api/tasks)
  .get(getTasks);    // User ke saare tasks lene ke liye (GET /api/tasks)

router.route("/:id")
  .put(updateTask)    // Task ko update karne ke liye (PUT /api/tasks/123)
  .delete(deleteTask); // Task ko delete karne ke liye (DELETE /api/tasks/123)

  // Yeh route task ID lega aur 'taskFile' field mein PDF file expect karega
router.route("/:id/upload").post(uploadPdf.single("taskFile"), uploadTaskFile);

module.exports = router;