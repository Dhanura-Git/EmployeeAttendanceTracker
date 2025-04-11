const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    leaveType: { 
        type: String, 
        enum: ["sick_leave", "medical_emergency", "normal_leave", "family_matters", "half_day_forenoon", "half_day_afternoon"],
        required: true
    },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
});

module.exports = mongoose.model("Leave", LeaveSchema);
 