const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const mongoose = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcryptjs')

dotenv.config()

connectDB()

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/auth', require('./routes/authRoutes'))

app.get("/", (req,res)=>{
    res.send('API is running..')
})

require('./cron/reminderJobs')
require('./cron/leaveAutoMarking')
require("./cron/salaryNotification");


const createFirstAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ role: "admin" });

        if (!existingAdmin) {
            const admin = new User({
                username: "Admin",
                email: "admin@example.com",
                password: "Admin@123",
                role: "admin",
                designation: "COO"
            });

            await admin.save();
            console.log("✅ First admin user created successfully");
        } else {
            console.log("ℹ️ Admin already exists");
        }
    } catch (error) {
        console.error("❌ Error creating admin:", error);
    }
};


createFirstAdmin();


const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>console.log(`Server is running at: http://localhost:${PORT}`))