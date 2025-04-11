const Holiday = require('../models/Holiday');

// Add new holiday
const addHoliday = async (req, res) => {
    try {
        const { date, remark } = req.body;

        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize time to compare

        if (selectedDate <= today) {
            return res.status(400).json({ message: "Only future dates can be marked as holidays." });
        }

        const exists = await Holiday.findOne({ date: selectedDate });
        if (exists) {
            return res.status(400).json({ message: "Holiday already marked for this date." });
        }

        const holiday = new Holiday({ date: selectedDate, remark });
        await holiday.save();
        res.status(201).json({ message: "Holiday marked successfully.", holiday });
    } catch (error) {
        res.status(500).json({ message: "Error marking holiday", error });
    }
};

// Get all holidays (you can filter by upcoming on frontend)
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.status(200).json(holidays);
    } catch (error) {
        res.status(500).json({ message: "Error fetching holidays", error });
    }
};

// Delete a holiday
const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        await Holiday.findByIdAndDelete(id);
        res.status(200).json({ message: "Holiday deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting holiday", error });
    }
};


module.exports={
    addHoliday,
    getHolidays,
    deleteHoliday
}