import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Assuming admin routes are prefixed with /api/admin

export const getDashboardData = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
