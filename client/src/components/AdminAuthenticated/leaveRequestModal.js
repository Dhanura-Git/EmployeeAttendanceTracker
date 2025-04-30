import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Spinner } from "react-bootstrap";
import { fetchLeaveRequests, updateLeaveStatus } from "../../services/attendanceService";
import { toast } from "react-toastify";

const LeaveRequestModal = ({ show, onHide }) => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadLeaveRequests = async () => {
        setLoading(true);
        try {
            const response = await fetchLeaveRequests();
            setLeaveRequests(response);
        } catch (error) {
            toast.error("Failed to fetch leave requests");
        }
        setLoading(false);
    };

    const handleLeaveStatusChange = async (leaveId, status) => {
        try {
            // Make sure status is lowercase to match the schema enum values
            const formattedStatus = status.toLowerCase();
            
            await updateLeaveStatus(leaveId, formattedStatus);
            toast.success(`Leave request ${status} successfully`);
            setLeaveRequests(prev => prev.filter(leave => leave._id !== leaveId));
        } catch (error) {
            console.error("Error in handleLeaveStatusChange:", error);
            toast.error("Failed to update leave status");
        }
    };

    const showConfirmationToast = (leaveId, status) => {
        const actionMessages = {
            "approved": "approve",
            "rejected": "reject",
        };

        const confirmationToast = toast(
            <div>
                <p>Are you sure you want to {actionMessages[status]} this leave request?</p>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => {
                            handleLeaveStatusChange(leaveId, status);
                            toast.dismiss(confirmationToast);
                        }}
                        className="btn btn-primary"
                    >
                        Yes, Confirm
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

    useEffect(() => {
        if (show) {
            loadLeaveRequests();
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Leave Requests</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                    </div>
                ) : leaveRequests.filter(leave => leave.status === "pending").length === 0 ? (
                    <p>No pending requests</p>
                ) : (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Email</th>
                                <th>Leave Dates</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.filter(leave => leave.status === "pending")
                                .map((leave) => (
                                    <tr key={leave._id}>
                                        <td>{leave.userId?.username || "N/A"}</td>
                                        <td>{leave.userId?.email || "N/A"}</td>
                                        <td>
                                            {leave.date?.map(d => new Date(d).toLocaleDateString()).join(", ")}
                                        </td>
                                        <td>{leave.leaveType}</td>
                                        <td>{leave.status}</td>
                                        <td>
                                            {leave.status === "pending" && (
                                                <div className="d-flex gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => showConfirmationToast(leave._id, "approved")}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => showConfirmationToast(leave._id, "rejected")}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default LeaveRequestModal;