const Attendance = require('../models/Attendance');
const Leave = require("../models/Leave");


const clockIn = async (req, res) => {
    try {
        const userId = req.user.id;

        // Define today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const leave = await Leave.findOne({
            userId,
            date: { $gte: startOfDay, $lte: endOfDay },
            status: "approved"
        });
        
        if (leave) {
            return res.status(403).json({
                success: false,
                message: "Clock-in restricted: You have an approved leave today."
            });
        }

        const activeSession = await Attendance.findOne({
            userId,
            clockOut: { $exists: false }
        });
        
        if (activeSession) {
            return res.status(400).json({
                success: false,
                message: "You're already clocked in. Please clock out first."
            });
        }
        
        const now = new Date();
        const attendance = new Attendance({
            userId,
            date: now,  // Store as Date object (requires schema change)
            clockIn: now
        });

        await attendance.save();
        res.status(201).json({
            success: true,
            message: "Clock-in successful",
            attendance
        });
    } catch (error) {
        console.error("❌ Clock-in error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
};

const clockOut = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find today's active attendance record based on userId
        const attendance = await Attendance.findOne({
            userId,
            clockOut: { $exists: false }  // Just look for records without clockOut
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: "No active session found"
            });
        }

        // Set clockOut time
        attendance.clockOut = new Date();

        // Calculate total hours
        const totalMilliseconds = attendance.clockOut - attendance.clockIn;
        attendance.totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(2);

        // Save the attendance record
        await attendance.save();

        // Define today's date range for calculating total hours
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Calculate total hours worked today across all sessions
        const allSessions = await Attendance.find({
            userId,
            clockIn: { $gte: startOfDay, $lte: endOfDay },
            clockOut: { $exists: true }
        });

        const totalMillisecondsToday = allSessions.reduce((total, session) => {
            return total + (new Date(session.clockOut) - new Date(session.clockIn));
        }, 0);

        // Convert total milliseconds today into HH:MM:SS
        const totalSecondsToday = Math.floor(totalMillisecondsToday / 1000);
        const totalHoursToday = Math.floor(totalSecondsToday / 3600);
        const totalMinutesToday = Math.floor((totalSecondsToday % 3600) / 60);
        const totalSecondsRemainingToday = totalSecondsToday % 60;

        // Format HH:MM:SS
        const formattedTotalHoursToday = `${String(totalHoursToday).padStart(2, "0")}:${String(totalMinutesToday).padStart(2, "0")}:${String(totalSecondsRemainingToday).padStart(2, "0")}`;

        res.status(200).json({
            success: true,
            message: "Clock-out successful",
            attendance,
            totalHoursToday: formattedTotalHoursToday
        });
    } catch (error) {
        console.error("❌ Clock-out error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error
        });
    }
};


const submitLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { leaveType } = req.body;

        if (!leaveType) {
            return res.status(400).json({ success: false, message: "Leave type is required" });
        }

        const leaveRequest = new Leave({
            userId,
            leaveType,
            date: new Date()
        });

        await leaveRequest.save();

        return res.status(200).json({ success: true, message: "Leave request submitted successfully" });
    } catch (error) {
        console.error("Leave request error:", error);
        return res.status(500).json({ success: false, message: "Server error during leave request" });
    }
};

const getUserAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query; // Get month & year from query params

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Month and year are required" });
        }

        // Get attendance records for the given month & year
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-31`);

        const attendanceRecords = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }
        });

        res.status(200).json({ success: true, attendanceRecords });
    } catch (error) {
        console.error("Error fetching user attendance:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getTodayAttendanceStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get start of today (midnight)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Find active sessions that started today
        const session = await Attendance.findOne({
            userId,
            clockIn: { $gte: startOfToday },  // Only sessions that started today
            clockOut: { $exists: false }
        });

        if (session) {
            return res.status(200).json({
                success: true,
                clockedIn: true,
                startTime: session.clockIn
            });
        } else {
            return res.status(200).json({
                success: true,
                clockedIn: false
            });
        }
    } catch (error) {
        console.error("❌ Error checking attendance status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};




module.exports = {
    clockIn,
    clockOut,
    submitLeaveRequest,
    getUserAttendance,
    getTodayAttendanceStatus
};