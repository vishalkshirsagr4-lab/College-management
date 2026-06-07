const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

const sendOTP = async (email, otp) => {
  try {
    await transporter.verify();
    console.log("✅ Brevo SMTP Connected");

    const mailOptions = {
      from: `"College Management" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>
          <p>Your OTP code is:</p>
          <h1 style="color:#007bff;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
};

module.exports = {
  sendOTP,
};