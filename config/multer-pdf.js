// backend/config/multer-pdf.js

const multer = require("multer");

// File ko server par save karne ke bajaye memory mein rakho
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Sirf PDF files ko ijazat do
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Example: 5MB limit
});

module.exports = uploadPdf;