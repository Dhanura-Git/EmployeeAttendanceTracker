const User = require('../models/User');
const bcrypt = require("bcryptjs");

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = req.file.secure_url || req.file.path;
        await user.save();

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilePicture: user.profilePicture, 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ 
            username: user.username, 
            email: user.email, 
            profilePicture: user.profilePicture 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect." });

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    uploadProfilePicture,
    getUserProfile,
    changePassword
};
