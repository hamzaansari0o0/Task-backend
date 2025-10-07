
const multer = require("multer");

// File ko server par save karne ke bajaye memory mein rakho
const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  // Sirf image files ko ijazat do
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

module.exports = multer({ storage, fileFilter });