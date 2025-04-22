const express = require('express')
const { signup, login, logout } = require('../controllers/authController')
const { createUser,getUsers, deleteUser, getAllLeaveRequests, updateLeaveStatus, setSalaryForUser, getUserReport, getAdminDashboardData } = require('../controllers/adminController')
const { uploadProfilePicture,getUserProfile, changePassword } = require('../controllers/profileController')
const { clockIn, clockOut, submitLeaveRequest, getUserAttendance, getTodayAttendanceStatus } = require("../controllers/attendanceController");
const { addHoliday, getHolidays, deleteHoliday } = require('../controllers/holidayController')
const {authMiddleware, adminMiddleware} = require('../middleware/authMiddleware')
const upload = require("../middleware/uploadMiddleware");


const router = express.Router()

//authentication routes
router.post("/signup", signup);
router.post('/login', login)
router.post('/logout', logout)

//admin routes
router.post("/create-user", authMiddleware, adminMiddleware, createUser);
router.get('/users', authMiddleware, adminMiddleware, getUsers)
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser)

//profile routes
router.post("/upload-profile", authMiddleware, upload.single("profilePicture"), uploadProfilePicture);
router.get("/user-profile", authMiddleware, getUserProfile);
router.post('/change-password', authMiddleware, changePassword);

//attendance routes
router.post("/clock-in", authMiddleware, clockIn);
router.post("/clock-out", authMiddleware, clockOut);
router.post("/submit-leave", authMiddleware, submitLeaveRequest);

router.get('/leaves', getAllLeaveRequests);
router.put('/leaves/:leaveId', updateLeaveStatus);

router.get("/attendance", authMiddleware, getUserAttendance);
router.get("/status", authMiddleware, getTodayAttendanceStatus);

// holiday routes 
router.post("/holidays", authMiddleware, adminMiddleware, addHoliday);
router.get("/holidays", authMiddleware, getHolidays); // both user/admin can view
router.delete("/holidays/:id", authMiddleware, adminMiddleware, deleteHoliday);
 
//salary routes
router.put("/set-salary/:userId", authMiddleware, adminMiddleware, setSalaryForUser);

router.get('/report', getUserReport);

router.get('/dashboard', authMiddleware, adminMiddleware, getAdminDashboardData);




module.exports = router