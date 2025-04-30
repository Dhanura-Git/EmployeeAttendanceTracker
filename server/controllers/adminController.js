const User = require('../models/User');
const Leave = require('../models/Leave')
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');

const createUser = async (req, res) => {
    const { username, email, password, role, designation } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ username, email, password, role, designation });
        await user.save();

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


const getAllLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await Leave.find().populate('userId', 'username email'); // Populate user details
        res.status(200).json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests', error });
    }
};

const updateLeaveStatus = async (req, res) => {
    const { leaveId } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    try {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        leave.status = status; // Update status
        await leave.save();

        res.status(200).json({ message: `Leave request ${status}`, leave });
    } catch (error) {
        res.status(500).json({ message: 'Error updating leave request status', error });
    }
};

const setSalaryForUser = async (req, res) => {
    const { salary, salaryPayDate } = req.body;
    const { userId } = req.params;

    if (!userId || salary == null || !salaryPayDate) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.salary = salary;
        user.salaryPayDate = salaryPayDate;
        await user.save();

        res.status(200).json({ message: "Salary and pay date updated successfully", user });
    } catch (error) {
        console.error("Error updating salary:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getUserReport = async (req, res) => {
    try {
        const { designation, joinedAfter, joinedBefore } = req.query;

        // Build filter
        const filter = {};
        if (designation) filter.designation = designation;
        if (joinedAfter || joinedBefore) {
            filter.createdAt = {};
            if (joinedAfter) filter.createdAt.$gte = new Date(joinedAfter);
            if (joinedBefore) filter.createdAt.$lte = new Date(joinedBefore);
        }

        const users = await User.find(filter).lean(); // lean() for plain JS object

        // Get all approved leaves in one go
        const leaves = await Leave.aggregate([
            { $match: { status: "approved" } },
            { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]);

        const leaveMap = new Map(leaves.map(leave => [leave._id.toString(), leave.count]));

        const userReport = users.map(user => ({
            _id: user._id,
            username: user.username,
            designation: user.designation,
            joinedAt: user.createdAt,
            salary: user.salary,
            salaryPayDate: user.salaryPayDate,
            totalLeavesTaken: leaveMap.get(user._id.toString()) || 0
        }));

        res.json(userReport);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while generating report" });
    }
};

const getAdminDashboardData = async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based

        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999); // last day of month

        const [totalUsers, activeUsers, totalLeaves, approvedLeaves, holidaysYear, holidaysMonth, totalAttendance, monthAttendance] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: "active" }),
            Leave.countDocuments(),
            Leave.countDocuments({ status: "approved" }),
            Holiday.countDocuments({ date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } }),
            Holiday.countDocuments({ date: { $gte: startOfMonth, $lte: endOfMonth } }),
            Attendance.aggregate([
                {
                    $match: {
                        clockIn: {
                            $gte: startOfMonth,
                            $lte: endOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$userId",
                        presentCount: { $sum: 1 },
                    },
                },
            ]),
            Attendance.aggregate([
                {
                    $match: {
                        clockIn: {
                            $gte: startOfMonth,
                            $lte: endOfMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$userId",
                        totalHours: { $sum: "$totalHours" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $project: {
                        _id: 0,
                        username: "$user.username",
                        designation: "$user.designation",
                        totalHours: 1
                    }
                },
                {
                    $sort: { totalHours: -1 }
                }
            ])
        ]);
        

        // Prepare monthly report (instead of today's)
        const monthlyWorkReport = monthAttendance;

        const presentCount = totalAttendance.length;

        res.json({
            totalUsers,
            totalHolidays: holidaysYear,
            holidaysThisMonth: holidaysMonth,
            totalLeaves,
            approvedLeaves,
            presentToday: presentCount,
            monthlyWorkReport,
            salaryDate: new Date(`${year}-${month + 1}-01`)
        });
        

    } catch (error) {
        console.error("Error getting dashboard data:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data" });
    }
};




module.exports = {
    createUser,
    getUsers,
    deleteUser,
    getAllLeaveRequests,
    updateLeaveStatus,
    setSalaryForUser,
    getUserReport,
    getAdminDashboardData
};
