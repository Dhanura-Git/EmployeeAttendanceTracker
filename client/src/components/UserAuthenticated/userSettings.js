import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, fetchUserProfile, uploadProfilePicture, changePassword } from "../../services/authService";
import { Container, Row, Col, Button, Form, Image, Card } from 'react-bootstrap';

const UserSettings = () => {
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

        if (formData.newPassword !== formData.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        try {
            const response = await changePassword(formData);
            alert(response.message);
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>User Settings</h2>
                        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body className="text-center">
                            <h3 className="mb-3">Profile Picture</h3>
                            {profilePicture && (
                                <div className="mb-3 d-flex justify-content-center">
                                    <Image
                                        src={profilePicture}
                                        alt="Profile"
                                        roundedCircle
                                        style={{ width: 100, height: 100, objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <Form onSubmit={handleProfilePictureUpload}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="file"
                                        onChange={handleProfilePictureChange}
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Upload Profile Picture
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h3 className="mb-3">Change Password</h3>
                            <Form onSubmit={handleChangePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Old Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="oldPassword"
                                        placeholder="Old Password"
                                        value={formData.oldPassword}
                                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm New Password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    Change Password
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}



export default UserSettings;