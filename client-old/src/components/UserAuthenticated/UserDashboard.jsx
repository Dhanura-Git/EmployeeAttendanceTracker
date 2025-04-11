import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, fetchUserProfile, uploadProfilePicture, changePassword } from "../../services/authService";


const UserDashboard = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [formData, setFormData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const userProfile = await fetchUserProfile();
                setProfilePicture(userProfile.profilePicture);
            } catch (error) {
                alert("Failed to fetch user profile");
            }
        };
        loadUserProfile();
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            logout();
            alert("Logged out successfully");
            navigate("/login");
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
                setProfilePicture(response.profilePicture); // Update state with the new profile picture URL
                setNewProfilePicture(null); // Reset file input
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

        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        try {
            const response = await changePassword(formData);
            alert(response.message);
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset form
        } catch (error) {
            alert(error.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <div>
            <h2>Hello User</h2>
            <button onClick={handleLogout}>Logout</button>
            {profilePicture && (
                <div>
                    <img src={profilePicture} alt="Profile" style={{ width: 100, height: 100, borderRadius: "50%" }} />
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
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    required
                />
                <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                />
                <button type="submit">Change Password</button>
            </form>

        </div>
    );
};

export default UserDashboard;
