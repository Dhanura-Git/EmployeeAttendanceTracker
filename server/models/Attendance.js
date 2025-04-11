const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    totalHours: { type: Number, default: 0 },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
 