import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"RRID Tech" <${process.env.EMAIL_USER}>`, // Ye SIRF bhejne wala (aapka) email hai
      to: to, // 👈 YE SABSE IMPORTANT HAI: Ye user ka email hai (jisko mail jayegi)
      subject: subject,
      text: text,
    });

    console.log(`✅ Email sent successfully to ${to}`);
    return info;
  } catch (err) {
    console.error(`❌ Email sending failed:`, err.message);
    throw new Error("Email sending failed");
  }
};
