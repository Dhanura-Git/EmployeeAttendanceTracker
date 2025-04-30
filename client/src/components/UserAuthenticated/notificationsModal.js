import React, { useState } from "react";
import { Modal, ListGroup, Badge, Button } from "react-bootstrap";

const NotificationsModal = ({ show, onHide, notifications, readNotifications }) => {
  // State to track locally dismissed notifications during the current modal session
  const [dismissedNotifications, setDismissedNotifications] = useState({});

  // Helper function to format date
  const formatDate = (dateArray) => {
    if (!dateArray || !dateArray.length) return "Unknown date";
    
    // Handle single date or date range
    if (dateArray.length === 1) {
      return new Date(dateArray[0]).toLocaleDateString();
    } else {
      const startDate = new Date(dateArray[0]).toLocaleDateString();
      const endDate = new Date(dateArray[dateArray.length - 1]).toLocaleDateString();
      return `${startDate} to ${endDate}`;
    }
  };

  // Helper function to get notification status color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return "bi bi-check-circle";
      case "rejected":
        return "bi bi-x-circle";
      default:
        return "bi bi-info-circle";
    }
  };

  // Helper function to convert leave type to display format
  const formatLeaveType = (type) => {
    if (!type) return "Leave";
    
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle dismissing a single notification
  const dismissNotification = (notificationId) => {
    setDismissedNotifications({
      ...dismissedNotifications,
      [notificationId]: true
    });
  };

  // Handle clearing all notifications
  const clearAllNotifications = () => {
    const allDismissed = {};
    notifications.forEach(notification => {
      allDismissed[notification._id] = true;
    });
    setDismissedNotifications(allDismissed);
  };

  // Filter out dismissed notifications
  const visibleNotifications = notifications.filter(
    notification => !dismissedNotifications[notification._id]
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Notifications</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {visibleNotifications.length === 0 ? (
          <p className="text-center py-3">No notifications to display</p>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-2">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearAllNotifications}
              >
                Clear All
              </Button>
            </div>
            <ListGroup variant="flush">
              {visibleNotifications.map((notification) => (
                <ListGroup.Item 
                  key={notification._id} 
                  className="d-flex align-items-start py-3"
                >
                  <div className="me-3">
                    <i 
                      className={getStatusIcon(notification.status)} 
                      style={{ 
                        fontSize: "1.5rem", 
                        color: notification.status === "approved" ? "green" : 
                              notification.status === "rejected" ? "red" : "gray" 
                      }}
                    ></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-1">Leave Request {notification.status === "approved" ? "Approved" : "Rejected"}</h6>
                      <div>
                        <Badge bg={getStatusColor(notification.status)} className="me-2">
                          {notification.status}
                        </Badge>
                        <Button 
                          variant="light" 
                          size="sm" 
                          className="p-0 border-0" 
                          onClick={() => dismissNotification(notification._id)}
                        >
                          <i className="bi bi-x-lg text-muted"></i>
                        </Button>
                      </div>
                    </div>
                    <p className="mb-1">
                      Your request for <strong>{formatLeaveType(notification.leaveType)}</strong> on <strong>{formatDate(notification.date)}</strong> has been <strong>{notification.status}</strong>.
                    </p>
                    <small className="text-muted">
                      {/* If you have timestamps for when status was updated, show it here */}
                      {/* {new Date(notification.updatedAt).toLocaleString()} */}
                    </small>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationsModal;