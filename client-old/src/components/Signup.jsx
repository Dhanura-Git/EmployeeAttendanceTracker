import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(formData);
            alert("Signup successful! Please login.");
            navigate("/login");
        } catch (error) {
            alert(error.response.data.message || "Signup failed");
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default Signup;
