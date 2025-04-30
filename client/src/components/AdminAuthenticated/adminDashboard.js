import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { getDashboardData } from "../../services/adminService";
import AdminLayout from "./adminLayout";
import { useNavigate } from "react-router-dom";


import LeaveRequestModal from "./leaveRequestModal";

const AdminDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isSalaryDay, setIsSalaryDay] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const monthName = new Date().toLocaleString('default', { month: 'long' });

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardData(); // Use existing service
                setDashboardData(data);

                const today = new Date();
                const salaryDate = new Date(data.salaryDate);
                setIsSalaryDay(today.getDate() === salaryDate.getDate());
            } catch (err) {
                console.error("Failed to load dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    if (loading) {
        return (
            <AdminLayout>
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" />
                </Container>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Container fluid className="p-4" style={{ backgroundColor: 'white', boxShadow: '0 0 0 15px #f0f0f0' }}>
                <Row className="mb-4">
                    <Col>
                        <h2>Hello Admin</h2>
                        <h6 className="text-muted">{currentTime.toLocaleString()}</h6>
                        {isSalaryDay && (
                            <Alert variant="success" className="mt-3">
                                🎉 Today is salary paying day!
                            </Alert>
                        )}
                    </Col>
                </Row>

                {/* Stats Cards */}
                <Row className="mb-4">
                    <Col md={3}>
                        <div onClick={() => navigate("/adminUsers")} style={{ cursor: "pointer" }}>
                            <Card className="shadow-lg border-0">
                                <Card.Body>
                                    <Card.Title className="text-muted">Total User</Card.Title>
                                    <h3>{dashboardData.totalUsers}</h3>
                                    <div className="text-primary small">👤 {dashboardData.activeUsers} Active User</div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    <Col md={3}>
                        <div onClick={() => navigate("/adminHolidayManager")} style={{ cursor: "pointer" }}>
                            <Card className="shadow-lg border-0">
                                <Card.Body>
                                    <Card.Title className="text-muted">Holiday This Year</Card.Title>
                                    <h3>{dashboardData.totalHolidays}</h3>
                                    <div className="text-danger small">🌴 {dashboardData.holidaysThisMonth || 0} Holiday This Month</div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    <Col md={3}>
                        <div onClick={() => navigate("/adminReport")} style={{ cursor: "pointer" }}>
                            <Card className="shadow-lg border-0">
                                <Card.Body>
                                    <Card.Title className="text-muted">Leave This Year</Card.Title>
                                    <h3>{dashboardData.totalLeaves}</h3>
                                    <div className="text-warning small">📝 {dashboardData.approvedLeaves || 0} Leave Granted</div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>

                    <Col md={3}>
                        <Card className="shadow-lg border-0">
                            <Card.Body>
                                <Card.Title className="text-muted">Present Today</Card.Title>
                                <h3>{dashboardData.presentToday}</h3>
                                <div className="text-info small">🕒 {dashboardData.totalUsers - dashboardData.presentToday} User Absent</div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>


                {/* Table */}
                <Row>
                    <Col>
                        <h4 className="mb-3">🕒Hours Logged in {monthName}</h4>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User</th>
                                    <th>Designation</th>
                                    <th>Total Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData?.monthlyWorkReport?.length > 0 ? (
                                    dashboardData.monthlyWorkReport.map((entry, index) => (
                                        <tr key={entry._id}>
                                            <td>{index + 1}</td>
                                            <td>{entry.username}</td>
                                            <td>{entry.designation}</td>
                                            <td>{entry.totalHours?.toFixed(2) || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No data available</td>
                                    </tr>
                                )}
                            </tbody>

                        </Table>
                    </Col>
                </Row>
            </Container>
        </AdminLayout>
    );
};

export default AdminDashboard;
