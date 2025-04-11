const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Warning: Email credentials are not set in .env file.");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generic sendMail function
const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Employee Attendance Tracker" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent:", info.response);
        return true;
    } catch (error) {
        console.error("Error sending email:", error.message);
        return false;
    }
};

// Link should point to your frontend clock-in page
const frontendUrl = "http://localhost:3000/userDashboard";

const sendClockInReminder = async (userEmail, userName) => {
    const subject = "⏰ Why haven't you clocked in?";
    const html = `
      <p>Hi ${userName},</p>
      <p>We noticed you haven't clocked in today. Please let us know the reason or clock in now using the button below:</p>
      <a href="${frontendUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Clock In Now</a>
      <p>Thank you!</p>
    `;
    return await sendMail(userEmail, subject, html);
};

// 📧 Clock-out Reminder Email
const sendClockOutReminder = async (userEmail, userName) => {
    const subject = "⏳ Clock-out Reminder";
    const html = `
      <p>Hi ${userName},</p>
      <p>It looks like you haven't clocked out today. If you forgot, please do it now or reply with the reason.</p>
      <a href="${frontendUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Clock Out Now</a>
      <p>Thanks!</p>
    `;
    return await sendMail(userEmail, subject, html);
};

// 📢 Salary Day Notification for Employee
const sendSalaryNotificationToUser = async (userEmail, userName) => {
    const subject = "💰 It's Your Salary Day!";
    const html = `
      <p>Hi ${userName},</p>
      <p>Great news! Today is your salary day. Please check your dashboard for updates regarding the credit.</p>
      <p>Keep up the great work!</p>
    `;
    return await sendMail(userEmail, subject, html);
};
  
// 📢 Salary Day Notification for Admin
const sendSalaryNotificationToAdmin = async (adminEmail, adminName) => {
    const subject = "💰 Salary Processing Day Reminder";
    const html = `
      <p>Hi ${adminName},</p>
      <p>Today is a salary disbursement day. Please ensure that the salaries are processed and marked accordingly in the system.</p>
      <p>You can view the salary section in your admin dashboard for details.</p>
    `;
    return await sendMail(adminEmail, subject, html);
};

// Leave notification for half-day
const sendHalfDayLeaveNotification = async (userEmail, userName) => {
  const subject = "🏖️ Half-Day Leave Marked";
  const html = `
    <p>Hi ${userName},</p>
    <p>We've noticed you haven't clocked in today and have automatically marked a half-day leave for you.</p>
    <p>If this was unintended, please contact your admin.</p>
    <a href="${frontendUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  `;
  return await sendMail(userEmail, subject, html);
};

// Leave notification for full-day
const sendFullDayLeaveNotification = async (userEmail, userName) => {
  const subject = "🏖️ Full-Day Leave Marked";
  const html = `
    <p>Hi ${userName},</p>
    <p>We've noticed you haven't clocked in today and have automatically marked a full-day leave for you.</p>
    <p>If this was unintended, please contact your admin.</p>
    <a href="${frontendUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  `;
  return await sendMail(userEmail, subject, html);
};



module.exports = {
    sendMail,
    sendClockInReminder,
    sendClockOutReminder,
    sendSalaryNotificationToUser,
    sendSalaryNotificationToAdmin,
    sendHalfDayLeaveNotification,
    sendFullDayLeaveNotification
};