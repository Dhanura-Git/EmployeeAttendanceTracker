import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, fetchUsers, createUser } from "../../services/authService";
import { fetchLeaveRequests, updateLeaveStatus } from "../../services/attendanceService";
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import { toast } from "react-toastify";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "employee",
        designation: ""
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSalaryDay, setIsSalaryDay] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
        loadLeaveRequests();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            setUsers(response);

            // Check if today is salary paying day for any user
            const todayDay = new Date().getDate(); // Gets day of month (1-31)
            const isTodaySalaryDay = response.some(user => {
                if (!user.salaryPayDate) return false;
                const userSalaryDay = parseInt(user.salaryPayDate, 10);
                return !isNaN(userSalaryDay) && todayDay === userSalaryDay;
            });

            setIsSalaryDay(isTodaySalaryDay);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data);
            toast.error("Failed to fetch users");
        }
    };


    const loadLeaveRequests = async () => {
        try {
            const response = await fetchLeaveRequests();
            setLeaveRequests(response);
        } catch (error) {
            toast.error("Failed to fetch leave requests");
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            toast.success("Logged out successfully");
            navigate("/login");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(formData);
            toast.success("User created successfully");
            setFormData({ username: "", email: "", password: "", role: "employee", designation: "" });
            loadUsers();
        } catch (error) {
            toast.error("Failed to create user");
        }
    };

    const handleLeaveStatusChange = async (leaveId, status) => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;

        try {
            await updateLeaveStatus(leaveId, status);
            console.log(updateLeaveStatus, 'updateleavestaus in front');

            toast.success(`Leave request ${status.toLowerCase()} successfully`);
            loadLeaveRequests();
        } catch (error) {
            toast.error("Failed to update leave status");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2>Hello Admin</h2>
                        {isSalaryDay && (
                            <div className="alert alert-success mt-3">
                                🎉 Today is salary paying day!
                            </div>
                        )} 

                        <h5>{currentTime.toLocaleString()}</h5>
                        <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
                    </div>
                </Col>
            </Row>

            <h3 className="mt-4">User Management</h3>
            <Form onSubmit={handleCreateUser} className="mb-4">
                <Row>
                    <Col>
                        <Form.Control type="text" name="username" placeholder="Username" onChange={handleChange} required />
                    </Col>
                    <Col>
                        <Form.Control type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    </Col>
                    <Col>
                        <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} required />
                    </Col>
                    <Col>
                        <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </Form.Select>
                    </Col>
                    <Col>
                        <Form.Select name="designation" value={formData.designation} onChange={handleChange} required>
                            <option value="">Select Designation</option>
                            {formData.role === "admin" ? (
                                <option value="COO">COO</option>
                            ) : (
                                <>
                                    <option value="Developer">Developer</option>
                                    <option value="Designer">Designer</option>
                                    <option value="HR">HR</option>
                                    <option value="Manager">Manager</option>
                                    <option value="QA">QA</option>
                                </>
                            )}
                        </Form.Select>
                    </Col>
                    <Col>
                        <Button variant="primary" type="submit">Create User</Button>
                    </Col>
                </Row>
            </Form>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Designation</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.designation}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Leave Requests Table */}
            <h3 className="mt-4">Leave Requests</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Employee Name</th>
                        <th>Email</th>
                        <th>Leave Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map(leave => (
                        <tr key={leave._id}>
                            <td>{leave.userId?.username || "N/A"}</td>
                            <td>{leave.userId?.email || "N/A"}</td>
                            <td>{new Date(leave.date).toLocaleDateString()}</td>
                            <td>{leave.leaveType}</td>
                            <td>{leave.status}</td>
                            <td>
                                {leave.status === "pending" && (
                                    <>
                                        <Button variant="success" size="sm" onClick={() => handleLeaveStatusChange(leave._id, "approved")}>
                                            Approve
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleLeaveStatusChange(leave._id, "rejected")}>
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminDashboard;



// components/AdminAuthenticated/AdminDashboard.js

// import React from 'react';

// const AdminDashboard = () => {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       {/* Total Users */}
//       <div className="bg-blue-200 text-blue-900 p-6 rounded-2xl shadow">
//         <h3 className="text-xl font-semibold mb-2">Total Users</h3>
//         <p className="text-3xl font-bold">42</p>
//       </div>

//       {/* Holidays this year */}
//       <div className="bg-green-200 text-green-900 p-6 rounded-2xl shadow">
//         <h3 className="text-xl font-semibold mb-2">Holidays This Year</h3>
//         <p className="text-3xl font-bold">15</p>
//       </div>

//       {/* Leaves taken this year */}
//       <div className="bg-yellow-200 text-yellow-900 p-6 rounded-2xl shadow">
//         <h3 className="text-xl font-semibold mb-2">Leaves Taken</h3>
//         <p className="text-3xl font-bold">67</p>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
