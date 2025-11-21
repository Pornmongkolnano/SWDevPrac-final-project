const nodemailer = require("nodemailer");

/**
 * Send an email using SMTP credentials defined in environment variables.
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message body
 */
const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_EMAIL,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
