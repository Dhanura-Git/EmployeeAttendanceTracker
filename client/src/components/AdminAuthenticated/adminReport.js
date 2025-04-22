import { useState, useEffect } from "react";
import { Container, Row, Col, Table, Form, Button, Spinner } from "react-bootstrap";
import AdminLayout from "./adminLayout";
import axios from "axios";

const AdminReport = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        designation: "",
        joinedAfter: "",
        joinedBefore: "",
    });

    const token = localStorage.getItem("token");

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.designation) params.append("designation", filters.designation);
            if (filters.joinedAfter) params.append("joinedAfter", filters.joinedAfter);
            if (filters.joinedBefore) params.append("joinedBefore", filters.joinedBefore);

            const response = await axios.get(`http://localhost:5000/api/auth/report?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <AdminLayout>
            <Container fluid className="p-4" style={{ backgroundColor: "white" }}>
                <h3 className="mb-4">Admin Report</h3>

                <Form onSubmit={handleFilterSubmit} className="mb-4">
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Designation</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="designation"
                                    placeholder="e.g. Developer"
                                    value={filters.designation}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Joined After</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="joinedAfter"
                                    value={filters.joinedAfter}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Joined Before</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="joinedBefore"
                                    value={filters.joinedBefore}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" type="submit" className="w-100">
                                Filter
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {loading ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Designation</th>
                                <th>Joined At</th>
                                <th>Total Leave Taken</th>
                                <th>Salary Day</th>
                                <th>Salary Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.designation}</td>
                                        <td>{new Date(user.joinedAt).toLocaleDateString()}</td>
                                        <td>{user.totalLeavesTaken}</td>
                                        <td>{user.salaryPayDate || "-"}</td>
                                        <td>{user.salary ? `₹${user.salary}` : "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </Container>
        </AdminLayout>
    );
};

export default AdminReport;
