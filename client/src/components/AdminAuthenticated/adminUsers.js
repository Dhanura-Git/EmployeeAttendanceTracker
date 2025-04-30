import { useState, useEffect } from "react";
import { fetchUsers, createUser } from "../../services/authService";
import { fetchLeaveRequests, updateLeaveStatus } from "../../services/attendanceService";
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import { toast } from "react-toastify";
import AdminLayout from "./adminLayout";

const AdminUsers = () => {
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

    useEffect(() => {
        loadUsers();
        loadLeaveRequests();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            setUsers(response);

            const todayDay = new Date().getDate();
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
            toast.success(`Leave request ${status.toLowerCase()} successfully`);
            loadLeaveRequests();
        } catch (error) {
            toast.error("Failed to update leave status");
        }
    };

    return (
        <AdminLayout>
            <Container fluid>
                <h3>User Management</h3>
                <Form onSubmit={handleCreateUser} className="mb-4">
                    <Row>
                        <Col>
                            <Form.Control type="text" name="username" placeholder="Username" onChange={handleChange} value={formData.username} required />
                        </Col>
                        <Col>
                            <Form.Control type="email" name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
                        </Col>
                        <Col>
                            <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
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

                {/* <h3 className="mt-4">Leave Requests</h3>
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
                                <td>
                                    {leave.date?.map(d => new Date(d).toLocaleDateString()).join(", ")}
                                </td>

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
                </Table> */}
            </Container>
        </AdminLayout>
    );
};

export default AdminUsers;
