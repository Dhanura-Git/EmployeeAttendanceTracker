import React, { useEffect, useState } from "react";
import { Navbar, Nav, Image, Modal } from "react-bootstrap";
import { fetchUserProfile, logout } from "../../services/authService";
import { fetchLeaveRequests } from "../../services/attendanceService";
import { toast } from "react-toastify"; // Import toast
import { useNavigate } from "react-router-dom";
import AdminSettings from "./adminSettings";
import LeaveRequestModal from "./leaveRequestModal"; // <--- NEW Import

const Topbar = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState({
    username: "",
    profilePicture: ""
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false); // <--- Modal State

  const openSettingsModal = () => setShowSettings(true);
  const closeSettingsModal = () => setShowSettings(false);

  useEffect(() => {
    const getAdminProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setAdminData(profile);
      } catch (error) {
        console.error("Failed to fetch admin profile", error);
      }
    };
    getAdminProfile();
  }, []);

  const [newLeaveCount, setNewLeaveCount] = useState(0);

  useEffect(() => {
    const fetchNewLeaves = async () => {
      try {
        const res = await fetchLeaveRequests();
        const pendingLeaves = res.filter(leave => leave.status === "pending");
        setNewLeaveCount(pendingLeaves.length);
      } catch (err) {
        console.error("Error fetching leaves", err);
      }
    };

    fetchNewLeaves();
    const interval = setInterval(fetchNewLeaves, 10000);
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

  const handleNotificationClick = () => {
    setShowLeaveModal(true); // <--- Open the leave modal
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="justify-content-between px-4 py-2 shadow-sm topbar-nav">
        <Navbar.Text className="topbar-text">
          <strong>{adminData.username}</strong>
        </Navbar.Text>

        <Nav className="align-items-center gap-3">
          <Nav.Link onClick={handleNotificationClick}>
            <i className="bi bi-bell" style={{ fontSize: "1.3rem", position: "relative" }}>
              {newLeaveCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.7rem"
                  }}
                >
                  {newLeaveCount}
                </span>
              )}
            </i>
          </Nav.Link>

          <Navbar.Text style={{ cursor: "pointer" }} onClick={openSettingsModal}>
            <Image
              src={adminData.profilePicture || "/default-avatar.png"}
              roundedCircle
              width={35}
              height={35}
              alt="Profile"
            />
          </Navbar.Text>
          <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
        </Nav>
      </Navbar>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={closeSettingsModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Admin Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminSettings />
        </Modal.Body>
      </Modal>

      {/* Leave Requests Modal */}
      <LeaveRequestModal show={showLeaveModal} onHide={() => setShowLeaveModal(false)} />
    </>
  );
};

export default Topbar;
