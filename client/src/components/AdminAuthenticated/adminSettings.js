import { useState, useEffect } from "react";
import { fetchUserProfile, uploadProfilePicture, changePassword } from "../../services/authService";
import { Container, Row, Col, Button, Form, Image, Card } from 'react-bootstrap';
import { toast } from 'react-toastify'; // Import toast for notifications

const AdminSettings = () => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

    useEffect(() => {
        loadAdminProfile();
    }, []);

    const loadAdminProfile = async () => {
        try {
            const userProfile = await fetchUserProfile();
            setProfilePicture(userProfile.profilePicture);
        } catch (error) {
            toast.error("Failed to fetch admin profile");
        }
    };

    const handleProfilePictureChange = (e) => {
        setNewProfilePicture(e.target.files[0]);
    };

    const handleProfilePictureUpload = async (e) => {
        e.preventDefault();
        if (!newProfilePicture) {
            toast.error("Please select a profile picture to upload.");
            return;
        }
        const formData = new FormData();
        formData.append("profilePicture", newProfilePicture);

        try {
            const response = await uploadProfilePicture(formData);
            if (response?.profilePicture) {
                toast.success("Profile picture updated successfully");
                setProfilePicture(response.profilePicture);
                setNewProfilePicture(null);
            } else {
                toast.error("Failed to upload profile picture");
            }
        } catch (error) {
            toast.error("Failed to upload profile picture");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        try {
            const response = await changePassword(passwordForm);
            toast.success(response.message);
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body className="text-center">
                            <h3>Profile Picture</h3>
                            {profilePicture && (
                                <div className="mb-3 d-flex justify-content-center">
                                    <Image src={profilePicture} alt="Admin Profile" roundedCircle style={{ width: 100, height: 100, objectFit: "cover" }} />
                                </div>
                            )}
                            <Form onSubmit={handleProfilePictureUpload}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="file" onChange={handleProfilePictureChange} />
                                </Form.Group>
                                <Button variant="primary" type="submit">Upload Profile Picture</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h3>Change Password</h3>
                            <Form onSubmit={handleChangePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Old Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="oldPassword"
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Confirm New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">Change Password</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminSettings;
