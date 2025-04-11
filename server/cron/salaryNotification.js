const cron = require("node-cron");
const User = require("../models/User");
const { sendSalaryNotificationToAdmin, sendSalaryNotificationToUser } = require("../utils/mail");

// Runs daily at 8:00 AM (correct cron expression)
cron.schedule("25 14 * * *", async () => {
    console.log("💰 Checking salary notifications...");

    const today = new Date(); 
    const todayDay = today.getDate(); // Only comparing the *date* (1–31)

    try {
        const users = await User.find({ salary: { $exists: true }, salaryPayDate: { $exists: true } });

        let isSalaryDay = false; 
        let notifiedUsers = 0;

        for (const user of users) {
            // Parse the string to an integer
            const userSalaryDay = parseInt(user.salaryPayDate, 10);
            
            // Add a check to ensure it's a valid number
            if (!isNaN(userSalaryDay) && todayDay === userSalaryDay) {
                isSalaryDay = true;
        
                if (user.role === "employee") {
                    try {
                        await sendSalaryNotificationToUser(user.email, user.username);
                        console.log(`✉️ Salary notification sent to employee ${user.username}`);
                        notifiedUsers++;
                    } catch (emailErr) {
                        console.error(`❌ Error sending salary notification to ${user.username}:`, emailErr.message);
                    }
                }
            }
        }

        // Send to admin if it's salary day for anyone
        if (isSalaryDay) {
            const admins = await User.find({ role: "admin" });
            for (const admin of admins) {
                try {
                    await sendSalaryNotificationToAdmin(admin.email, admin.username);
                    console.log(`✉️ Salary notification sent to admin ${admin.username}`);
                } catch (emailErr) {
                    console.error(`❌ Error sending salary notification to admin ${admin.username}:`, emailErr.message);
                }
            }
            console.log(`💰 Salary notifications sent to ${notifiedUsers} employees and ${admins.length} admins`);
        } else {
            console.log("💰 No salary payments due today");
        }

    } catch (err) {
        console.error("❌ Error in salary notification cron:", err.message);
    }
});

module.exports = {};