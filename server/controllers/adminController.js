const User = require('../models/User');
const Leave = require('../models/Leave')

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
    console.log(req.body,'reqbody in updateleavestatus');
    

    try {
        const leave = await Leave.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status; // Update status
        console.log(leave, 'updateleavestatus in back');
        
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



module.exports = {
    createUser,
    getUsers,
    deleteUser,
    getAllLeaveRequests,
    updateLeaveStatus,
    setSalaryForUser
};
