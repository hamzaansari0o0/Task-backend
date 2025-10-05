const transporter = require("../config/nodeMailer");

const sendVerificationEmail = async (user, token) => {
  const url = `http://localhost:5000/api/users/verify/${token}`;

  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your Email",
    html: `
      <h3>Hello ${user.name},</h3>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${url}">Verify Email</a>
    `,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `http://localhost:5173/reset-password/${token}`;


  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <h3>Hello ${user.name},</h3>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset it:</p>
      <a href="${url}">Reset Password</a>
      <p>If you didn’t request this, you can ignore this email.</p>
    `,
  });
};

// 🔹 OTP Email
const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h3>Your OTP Code</h3>
      <p>Use this code to login:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 5 minutes.</p>
    `,
  });
};
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendOtpEmail };
