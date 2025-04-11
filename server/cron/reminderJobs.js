const cron = require("node-cron");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const { sendClockInReminder, sendClockOutReminder } = require("../utils/mail");

// 9:00 AM - Clock-in reminder
cron.schedule("0 9 * * *", async () => {
    console.log("🔔 Running 9 AM clock-in reminder job");

    // Create date range for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Exclude admin users
        const users = await User.find({ role: { $ne: "admin" } });

        for (const user of users) {
            const attendance = await Attendance.findOne({ 
                userId: user._id, 
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (!attendance || !attendance.clockIn) {
                await sendClockInReminder(user.email, user.username);
                console.log(`✉️ Clock-in reminder sent to ${user.username}`);
            }
        }
    } catch (error) {
        console.error("Error in 9AM clock-in reminder job:", error.message);
    }
});

// 7:30 PM - Clock-out reminder and auto clock-out
cron.schedule("30 19 * * *", async () => {
    console.log("🔔 Running 7:30 PM clock-out reminder job");

    // Create date range for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Exclude admin users
        const users = await User.find({ role: { $ne: "admin" } });

        for (const user of users) {
            const attendance = await Attendance.findOne({ 
                userId: user._id, 
                date: { $gte: startOfDay, $lte: endOfDay },
                clockIn: { $exists: true },
                clockOut: { $exists: false }
            });

            if (attendance) {
                // 1️⃣ Send email
                await sendClockOutReminder(user.email, user.username);
                console.log(`✉️ Clock-out reminder sent to ${user.username}`);

                // 2️⃣ Auto clock out
                const clockOutTime = new Date();
                const clockInTime = new Date(attendance.clockIn);
                const totalHours = ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2);

                attendance.clockOut = clockOutTime;
                attendance.totalHours = totalHours;

                await attendance.save();

                console.log(`✅ Auto clocked out ${user.username} at ${clockOutTime.toLocaleTimeString()}`);
            }
        }
    } catch (error) {
        console.error("❌ Error in 7:30PM clock-out reminder job:", error.message);
    }
});
