import React, { useEffect, useState } from "react";
import { Navbar, Nav, Image, Modal } from "react-bootstrap";
import { fetchUserProfile, logout } from "../../services/authService"; // Adjust path if needed
import UserSettings from "./userSettings";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const Topbar = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    profilePicture: ""
  });

  const [showSettings, setShowSettings] = useState(false);

  const openSettingsModal = () => setShowSettings(true);
  const closeSettingsModal = () => setShowSettings(false);


  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserData(profile);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } // or use navigation if using React Router
  };

  const showNotifications = () => {
    alert("Notifications clicked");
  };

  return (
    <Navbar bg="light" expand="lg" className="justify-content-between px-4 py-2 shadow-sm topbar-nav">
      <Navbar.Text className="topbar-text">
        <strong>{userData.username}</strong>
      </Navbar.Text>

      <Nav className="align-items-center gap-3">
        <Nav.Link onClick={showNotifications}>
          <i className="bi bi-bell" style={{ fontSize: "1.3rem" }}></i>
        </Nav.Link>
        <Navbar.Text style={{ cursor: "pointer" }} onClick={openSettingsModal}>
          <Image
            src={userData.profilePicture || "/default-avatar.png"}
            roundedCircle
            width={35}
            height={35}
            alt="Profile"
          />
        </Navbar.Text>
        <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
      </Nav>
      <Modal show={showSettings} onHide={closeSettingsModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserSettings />
        </Modal.Body>
      </Modal>

    </Navbar>

  );
};

export default Topbar;
