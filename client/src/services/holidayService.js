import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; 

// Add a holiday
export const addHoliday = async (holidayData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/holidays`, holidayData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Get all holidays
export const getHolidays = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/holidays`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Delete a holiday
export const deleteHoliday = async (id) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/holidays/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
