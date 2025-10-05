
const dotenv = require("dotenv");
dotenv.config(); // ✅ ensure .env loaded
const nodemailer = require("nodemailer");

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail", // ya SMTP service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((err, success) => {
  if (err) console.log("Nodemailer verify error:", err);
  else console.log("Nodemailer ready to send messages ✅");
});

module.exports = transporter;
