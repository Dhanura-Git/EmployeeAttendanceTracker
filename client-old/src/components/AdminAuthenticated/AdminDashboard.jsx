import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, fetchUsers, createUser, fetchUserProfile, uploadProfilePicture, changePassword } from "../../services/authService";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [profilePicture, setProfilePicture] = useState(null);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "employee" });
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
        loadAdminProfile();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            setUsers(response);
        } catch (error) {
            alert("Failed to fetch users");
        }
    };

    const loadAdminProfile = async () => {
        try {
            const userProfile = await fetchUserProfile(); 
            setProfilePicture(userProfile.profilePicture);
        } catch (error) {
            alert("Failed to fetch admin profile");
        }
    };

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            logout();
            alert("Logged out successfully");
            navigate("/login");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            alert("User created successfully");
            setFormData({ username: "", email: "", password: "", role: "employee" }); 
            loadUsers(); 
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleProfilePictureChange = (e) => {
        setNewProfilePicture(e.target.files[0]);
    };

    const handleProfilePictureUpload = async (e) => {
        e.preventDefault();

        if (!newProfilePicture) {
            alert("Please select a profile picture to upload.");
            return;
        }
        const formData = new FormData();  
        formData.append("profilePicture", newProfilePicture);

        try {
            const response = await uploadProfilePicture(formData);
            if (response?.profilePicture) {
                alert("Profile picture updated successfully");
                setProfilePicture(response.profilePicture); 
                setNewProfilePicture(null); 
            } else {
                alert("Failed to upload profile picture");
            }
        } catch (error) {
            console.error("Error in profile picture upload:", error);
            alert("Failed to upload profile picture");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        try {
            const response = await changePassword(passwordForm);
            alert(response.message);
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
        } catch (error) {
            alert(error.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <div>
            <h2>Hello Admin</h2>
            <button onClick={handleLogout}>Logout</button>

            <h3>Admin Profile Picture</h3>
            {profilePicture && (
                <div>
                    <img src={profilePicture} alt="Admin Profile" style={{ width: 100, height: 100, borderRadius: "50%" }} />
                </div>
            )}
            <form onSubmit={handleProfilePictureUpload}>
                <input type="file" onChange={handleProfilePictureChange} />
                <button type="submit">Upload Profile Picture</button>
            </form>

            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
                <input
                    type="password"
                    name="oldPassword"
                    placeholder="Old Password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                />
                <button type="submit">Change Password</button>
            </form>

            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <select name="role" onChange={handleChange} required>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Create User</button>
            </form>

            <h3>Existing Users</h3>
            <ul>
                {users.map((user) => (
                    <li key={user._id}>{user.username} - {user.email} ({user.role})</li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
