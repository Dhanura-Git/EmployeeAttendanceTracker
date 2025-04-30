import React, { useEffect, useState, useRef } from "react";
import { Navbar, Nav, Image, Modal, Button } from "react-bootstrap";
import { fetchUserProfile, logout } from "../../services/authService";
import { fetchLeaveRequests } from "../../services/attendanceService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import UserSettings from "./userSettings";

const Topbar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ username: "", profilePicture: "" });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notifiedLeaveIds = useRef(new Set());

  const openSettingsModal = () => setShowSettings(true);
  const closeSettingsModal = () => setShowSettings(false);

  const openNotificationModal = () => {
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => setShowNotificationModal(false);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserData(profile);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        toast.error("Failed to fetch user profile");
      }
    };
    getUserProfile();
  }, []);

  useEffect(() => {
    // Load previously notified leave IDs from localStorage
    const savedIds = JSON.parse(localStorage.getItem('notifiedLeaveIds')) || [];
    notifiedLeaveIds.current = new Set(savedIds);

    const getUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserData(profile);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        toast.error("Failed to fetch user profile");
      }
    };
    getUserProfile();
  }, []);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const leaveRequests = await fetchLeaveRequests();
        const nonPendingLeaves = leaveRequests.filter(
          (leave) => leave.status !== "pending"
        );

        const newNotifications = nonPendingLeaves.filter(
          (leave) => !notifiedLeaveIds.current.has(leave._id)
        ).map((leave) => {
          notifiedLeaveIds.current.add(leave._id);
          return {
            message: `Your leave request for ${leave.date
              .map((d) => new Date(d).toLocaleDateString())
              .join(", ")} was ${leave.status.toUpperCase()}`,
            leaveId: leave._id,
            leaveDates: leave.date,
            status: leave.status,
          };
        });

        if (newNotifications.length > 0) {
          setNotifications((prev) => [...prev, ...newNotifications]);
          // Save updated notifiedLeaveIds to localStorage
          localStorage.setItem('notifiedLeaveIds', JSON.stringify([...notifiedLeaveIds.current]));
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const confirmationToast = toast(
      <div>
        <p>Are you sure you want to log out?</p>
        <div className="d-flex gap-2">
          <button
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
              navigate("/login");
              toast.dismiss(confirmationToast);
            }}
            className="btn btn-primary"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => toast.dismiss(confirmationToast)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "bottom-right",
        autoClose: false,
        closeButton: false,
        hideProgressBar: true,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="justify-content-between px-4 py-2 shadow-sm topbar-nav">
        <Navbar.Text className="topbar-text">
          <strong>{userData.username}</strong>
        </Navbar.Text>

        <Nav className="align-items-center gap-3">
          <Nav.Link>
            <i
              className="bi bi-bell"
              style={{ fontSize: "1.5rem", position: "relative", cursor: "pointer" }}
              onClick={openNotificationModal}
            >
              {notifications.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.7rem",
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </i>
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
      </Navbar>

      {/* Notification Modal */}
      <Modal show={showNotificationModal} onHide={closeNotificationModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-3 p-2 border rounded d-flex justify-content-between align-items-center"
                style={{
                  background: notification.status === "approved" ? "#d4edda" : "#f8d7da",
                }}
              >
                <div>
                  <strong>{notification.status === "approved" ? "✅ Approved" : "❌ Rejected"}</strong>
                  <p className="mb-0">{notification.message}</p>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    const dismissedLeaveId = notifications[index].leaveId;
                    setNotifications((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                    notifiedLeaveIds.current.add(dismissedLeaveId);
                    localStorage.setItem('notifiedLeaveIds', JSON.stringify([...notifiedLeaveIds.current]));
                  }}
                >
                  ✖
                </Button>
              </div>
            ))
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeNotificationModal}>
            Close
          </Button>
          {notifications.length > 0 && (
            <Button variant="primary" onClick={() => setNotifications([])}>
              Mark all as Read
            </Button>
          )}
        </Modal.Footer>

      </Modal>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={closeSettingsModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserSettings />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Topbar;
