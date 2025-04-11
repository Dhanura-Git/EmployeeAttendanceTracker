const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true }, // unique to avoid duplicates
    remark: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Holiday", HolidaySchema);
