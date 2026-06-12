const nodemailer = require('nodemailer');

const transporter = process.env.NODE_ENV === 'test'
  ? {
      sendMail: async (mailOptions) => {
        global.sentEmails = global.sentEmails || [];
        global.sentEmails.push(mailOptions);
        return { messageId: 'test-id' };
      }
    }
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@smartcafe.com',
    to,
    subject,
    html,
  };
  return await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail, transporter };
