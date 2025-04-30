import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const markClockIn = async () => {
    try {
        const token = localStorage.getItem("token");
        console.log("Making clock-in request to:", `${API_URL}/clock-in`);

        const response = await axios.post(`${API_URL}/clock-in`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Clock-in response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response?.status === 403) {
            return { success: false, message: "Clock-in restricted: You have an approved leave today." };
        }
        console.error("Clock-in error:", error.response ? error.response.data : error.message);
        return { success: false, message: "Clock-in failed" };
    }
};

export const markClockOut = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/clock-out`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Clock-out error:", error.response ? error.response.data : error.message);
        return { success: false, message: error.response?.data?.message || "Clock-out failed" };
    }
};

export const submitLeaveRequest = async (leaveType) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/submit-leave`,
            { leaveType },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Failed to submit leave request" };
    }
};

export const fetchLeaveRequests = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/leaves`, {
            headers: { Authorization: `Bearer ${token}` }
        }); 
        return response.data;
    } catch (error) {
        console.error("Error fetching leave requests:", error.response?.data?.message || error.message);
        return [];
    }
};

export const updateLeaveStatus = async (leaveId, status) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
            `${API_URL}/leaves/${leaveId}`,
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Leave status updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating leave status:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update leave status");
    }
};

export const fetchUserAttendance = async (month, year) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/attendance?month=${month}&year=${year}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data.attendanceRecords;
    } catch (error) {
        console.error("Error fetching user attendance:", error.response?.data?.message || error.message);
        return [];
    }
};

export const checkClockInStatus = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/status`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error checking clock-in status:", error);
        return { success: false };
    }
};

export const submitLeaveRequestForDates = async (leaveDates, reason, leaveType) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post( `${API_URL}/multipleDay-leave`,
            { leaveDates, reason, leaveType }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to submit leave request");
    }
};
