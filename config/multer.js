// const multer = require("multer");
// const path = require("path");

// // Storage config
// const storage = multer.diskStorage({
//   destination: (req, file, cb ) => {
//     cb(null, "uploads/"); // local uploads folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
//   },
// });

// // File filter (sirf images allow)
// const fileFilter = (req, file, cb) => {
//   const fileTypes = /jpeg|jpg|png|gif/;
//   const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = fileTypes.test(file.mimetype);

//   if (extname && mimetype) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images are allowed!"));
//   }
// };

// module.exports = multer({ storage, fileFilter });
///////////////////////////


// config/multer.js (Updated)
const multer = require("multer");

// Storage ko memory me rakho
const storage = multer.memoryStorage(); 

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

module.exports = multer({ storage, fileFilter });