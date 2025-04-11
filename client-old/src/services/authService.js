import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const signup = async (userData) => {
    return await axios.post(`${API_URL}/signup`, userData);
};

export const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    return response.data;
};

export const createUser = async (userData) => {
    const token = localStorage.getItem("token");
    await axios.post(`${API_URL}/create-user`, userData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Fetch user profile (including profile picture)
export const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const uploadProfilePicture = async (formData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/upload-profile`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const changePassword = async (passwordData) => {
    const token = localStorage.getItem("token");  
    try {
        const response = await axios.post(
            `${API_URL}/change-password`, 
            passwordData,
            {
                headers: {
                    Authorization: `Bearer ${token}`, 
                }
            }
        );
        return response.data;  
    } catch (error) {
        throw error.response; 
    }
};