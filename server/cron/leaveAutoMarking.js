const cron = require("node-cron");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const { sendHalfDayLeaveNotification, sendFullDayLeaveNotification } = require("../utils/mail");

// ⏰ 11:55 AM – mark half-day leave (you changed to 13:25)
cron.schedule("55 11 * * *", async () => {
  console.log("🏃 Half-day leave check running...");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Only get non-admin users
    const users = await User.find({ role: { $ne: "admin" } });

    for (const user of users) {
      const attendance = await Attendance.findOne({ 
        userId: user._id, 
        date: { $gte: startOfDay, $lte: endOfDay } 
      });
      
      const existingLeave = await Leave.findOne({ 
        userId: user._id, 
        date: { $gte: startOfDay, $lte: endOfDay } 
      });

      // Removed the role check since we're filtering in the query
      if (!attendance?.clockIn && !existingLeave) {
        await Leave.create({
          userId: user._id,
          leaveType: "half_day_forenoon",
          date: new Date(),
          status: "approved",
        });

        console.log(`✅ Half-day leave marked for ${user.username}`);
        
        // Send email notification
        try {
          await sendHalfDayLeaveNotification(user.email, user.username);
          console.log(`✉️ Half-day leave notification sent to ${user.username}`);
        } catch (emailErr) {
          console.error(`❌ Error sending half-day leave email to ${user.username}:`, emailErr.message);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in half-day leave cron:", err.message);
  }
});

// 🌙 7:35 PM – upgrade to full-day leave
cron.schedule("35 19 * * *", async () => {
  console.log("🌙 Full-day leave check running...");

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // Only get non-admin users
    const users = await User.find({ role: { $ne: "admin" } });

    for (const user of users) {
      const attendance = await Attendance.findOne({ 
        userId: user._id, 
        date: { $gte: startOfDay, $lte: endOfDay } 
      });
      
      const existingLeave = await Leave.findOne({ 
        userId: user._id, 
        date: { $gte: startOfDay, $lte: endOfDay } 
      });

      if (!attendance?.clockIn) {
        if (existingLeave && existingLeave.leaveType === "half_day_forenoon") {
          existingLeave.leaveType = "normal_leave";
          await existingLeave.save();
          console.log(`🔁 Upgraded to full-day leave for ${user.username}`);
          
          // Send email notification for upgraded leave
          try {
            await sendFullDayLeaveNotification(user.email, user.username);
            console.log(`✉️ Full-day leave notification sent to ${user.username} (upgraded from half-day)`);
          } catch (emailErr) {
            console.error(`❌ Error sending full-day leave email to ${user.username}:`, emailErr.message);
          }
        } else if (!existingLeave) {
          await Leave.create({
            userId: user._id,
            leaveType: "normal_leave",
            date: new Date(),
            status: "approved",
          });

          console.log(`❌ Full-day leave marked for ${user.username}`);
          
          // Send email notification for new full-day leave
          try {
            await sendFullDayLeaveNotification(user.email, user.username);
            console.log(`✉️ Full-day leave notification sent to ${user.username}`);
          } catch (emailErr) {
            console.error(`❌ Error sending full-day leave email to ${user.username}:`, emailErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in full-day leave cron:", err.message);
  }
});
