import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { markClockIn, markClockOut, submitLeaveRequest, fetchUserAttendance, checkClockInStatus } from "../../services/attendanceService";
import { getHolidays } from "../../services/holidayService";
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';

import AdminLayout from "./userLayout";

const UserDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [clockedIn, setClockedIn] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveReason, setLeaveReason] = useState("");
    const [totalHoursToday, setTotalHoursToday] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [halfDayType, setHalfDayType] = useState("");
    const [attendance, setAttendance] = useState([]);

    const [isTodayHoliday, setIsTodayHoliday] = useState(false);
    const [holidayRemark, setHolidayRemark] = useState("");
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);

    const [salaryDayMessage, setSalaryDayMessage] = useState("");

    const [chartData, setChartData] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            if (clockedIn && startTime) {
                setElapsedTime(Math.floor((new Date() - startTime) / 1000)); // in seconds
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [clockedIn, startTime]);

    useEffect(() => {
        const checkHolidayToday = async () => {
            try {
                const holidays = await getHolidays();
                const todayDate = new Date().toLocaleDateString();

                const todayHoliday = holidays.find(holiday => {
                    const holidayDate = new Date(holiday.date).toLocaleDateString();
                    return holidayDate === todayDate;
                });

                if (todayHoliday) {
                    setIsTodayHoliday(true);
                    setHolidayRemark(todayHoliday.remark);
                }

                // ✅ Upcoming holidays (after today)
                const futureHolidays = holidays
                    .filter(holiday => new Date(holiday.date) > new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date))

                setUpcomingHolidays(futureHolidays);
            } catch (err) {
                console.error("Failed to fetch holidays", err);
            }
        };

        checkHolidayToday();
    }, []);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await checkClockInStatus();
            if (status.success && status.clockedIn) {
                setClockedIn(true);
                const start = new Date(status.startTime);
                setStartTime(start);
                setElapsedTime(Math.floor((new Date() - start) / 1000));
            }
        };

        checkStatus();
    }, []);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const today = new Date();
            const month = today.getMonth() + 1; // JavaScript months are 0-based
            const year = today.getFullYear();

            const data = await fetchUserAttendance(month, year);
            setAttendance(data);
            setChartData(
                data.map(record => ({
                    date: new Date(record.date).toLocaleDateString(),
                    hours: record.totalHours || 0,
                }))
            );            
        };
        fetchAttendanceData();
    }, []);

    useEffect(() => {
        const checkSalaryDay = async () => {
            try {
                const response = await fetch("/api/user-profile", {
                    credentials: "include"
                });
                const data = await response.json();
                if (response.ok && data.salaryPayDate) {
                    const today = new Date();
                    const todayDay = today.getDate(); // gives 1 to 31

                    const salaryPayDay = parseInt(data.salaryPayDate, 10); // like 10

                    if (!isNaN(salaryPayDay) && todayDay === salaryPayDay) {
                        setSalaryDayMessage("🎉 Today is your salary day!");
                    }

                }
            } catch (error) {
                console.error("Failed to fetch profile or check salary day", error);
            }
        };

        checkSalaryDay();
    }, []);


    const formatHoursToHHMMSS = (hours) => {
        if (!hours || hours === "N/A") return "N/A";

        // Convert decimal hours to seconds
        const totalSeconds = Math.round(parseFloat(hours) * 3600);

        // Format to HH:MM:SS
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };


    const handleClockIn = async () => {
        try {
            const response = await markClockIn();
            if (response.success) {
                setClockedIn(true);
                setStartTime(new Date());
                setStatusMessage({ type: "success", text: "Successfully clocked in" });
                // Clear success message after 3 seconds
                setTimeout(() => setStatusMessage(null), 3000);
            } else {
                setStatusMessage({ type: "danger", text: response.message });
                setTimeout(() => setStatusMessage(null), 5000);
            }
        } catch (error) {
            console.error("Clock-in failed:", error);
            setStatusMessage({ type: "danger", text: "Clock-in failed. Please try again." });
        }
    };

    const handleClockOut = async () => {
        try {
            const response = await markClockOut();
            if (response.success) {
                setClockedIn(false);
                setStartTime(null);
                setElapsedTime(0);
                setTotalHoursToday(response.totalHoursToday);
                setStatusMessage({ type: "success", text: "Successfully clocked out" });
                setTimeout(() => setStatusMessage(null), 3000);
            } else {
                setStatusMessage({ type: "danger", text: response.message });
                setTimeout(() => setStatusMessage(null), 5000);
            }
        } catch (error) {
            console.error("Clock-out is failed:", error);
            setStatusMessage({ type: "danger", text: "Clock-out failed. Please try again." });
        }
    };

    const handleSubmitLeave = async () => {
        if (!leaveReason) {
            alert("Please select a leave type.");
            return;
        }

        const finalLeaveReason = leaveReason === "half_day" ? halfDayType : leaveReason;

        if (!finalLeaveReason) {
            alert("Please select a valid Half Day type.");
            return;
        }

        try {
            const response = await submitLeaveRequest(finalLeaveReason);
            if (response.success) {
                setShowLeaveModal(false);
                setStatusMessage({ type: "success", text: "Leave request submitted successfully" });
            } else {
                setStatusMessage({ type: "danger", text: response.message });
            }
        } catch (error) {
            console.error("Leave submission failed:", error);
            setStatusMessage({ type: "danger", text: "Failed to submit leave request. Try again." });
        }
    };

    return (
        <AdminLayout>
            <Container className="mt-4">
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <h2>Welcome, User</h2>
                        </div>
                    </Col>
                </Row>

                {statusMessage && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant={statusMessage.type}>
                                {statusMessage.text}
                            </Alert>
                        </Col>
                    </Row>
                )}

                {salaryDayMessage && (
                    <Row className="mb-3">
                        <Col>
                            <Alert variant="success">
                                {salaryDayMessage}
                            </Alert>
                        </Col>
                    </Row>
                )}


                <Row className="mb-3 justify-content-center">
                    <Col xs="auto" className="d-flex gap-3 justify-content-center flex-wrap">
                        {!clockedIn ? (
                            <Button
                                variant="success"
                                onClick={handleClockIn}
                                disabled={isTodayHoliday}
                            >
                                Clock In
                            </Button>
                        ) : (
                            <>
                                <Button variant="danger" onClick={handleClockOut}>Clock Out</Button>
                                <span className="align-self-center">
                                    ⏳ {Math.floor(elapsedTime / 3600)}h {Math.floor((elapsedTime % 3600) / 60)}m {elapsedTime % 60}s
                                </span>
                            </>
                        )}

                        <Button
                            variant="warning"
                            onClick={() => setShowLeaveModal(true)}
                        >
                            Take Leave
                        </Button>
                    </Col>
                </Row>


                {!clockedIn && isTodayHoliday && (
                    <Row className="mb-2 justify-content-center">
                        <Col md="auto">
                            <Alert variant="warning" className="text-center">
                                🚫 Today is a holiday: <strong>{holidayRemark}</strong>. You cannot clock in.
                            </Alert>
                        </Col>
                    </Row>
                )}

                <Row className="mb-4 justify-content-center">
                    <Col md="auto">
                        <h5 className="text-center">{currentTime.toLocaleString()}</h5>
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col>
                        <h4 className="text-center mb-3">📊 Worked Hours Summary</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#007bff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Col>
                </Row>



                {/* Leave Modal */}
                <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Request Leave</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Leave Type</Form.Label>
                                <Form.Select value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}>
                                    <option value="">Select Leave Type</option>
                                    <option value="sick_leave">Sick Leave</option>
                                    <option value="medical_emergency">Medical Emergency</option>
                                    <option value="normal_leave">Normal Leave</option>
                                    <option value="family_matters">Family Matters</option>
                                    <option value="half_day">Half Day</option>
                                </Form.Select>
                            </Form.Group>

                            {/* Show additional dropdown for Half Day selection */}
                            {leaveReason === "half_day" && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Half Day Type</Form.Label>
                                    <Form.Select value={halfDayType} onChange={(e) => setHalfDayType(e.target.value)}>
                                        <option value="">Select Half Day Type</option>
                                        <option value="half_day_forenoon">Forenoon (9 AM - 2 PM)</option>
                                        <option value="half_day_afternoon">Afternoon (2 PM - 7:30 PM)</option>
                                    </Form.Select>

                                </Form.Group>
                            )}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSubmitLeave}>Submit</Button>
                    </Modal.Footer>
                </Modal>

                <Row className="mt-4">
                    <Col>
                        <h4 className="text-primary">📅 Upcoming Holidays</h4>
                        {upcomingHolidays.length > 0 ? (
                            <table className="table table-sm table-bordered mt-2">
                                <thead className="table-light">
                                    <tr>
                                        <th>Sl no.</th>
                                        <th>Date</th>
                                        <th>Remark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingHolidays.map((holiday, index) => (
                                        <tr key={holiday._id}>
                                            <td>{index + 1}</td>
                                            <td>{new Date(holiday.date).toLocaleDateString()}</td>
                                            <td>{holiday.remark}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted">No upcoming holidays.</p>
                        )}
                    </Col>
                </Row>


                <Row className="mt-4">
                    <Col>
                        <h3>Monthly Attendance Summary</h3>
                        <table className="table table-bordered mt-3">
                            <thead className="table-info">
                                <tr>
                                    <th>Sl no.</th>
                                    <th>Date</th>
                                    <th>Check-In</th>
                                    <th>Check-Out</th>
                                    <th>Total Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length > 0 ? (
                                    attendance.map((record, index) => (
                                        <tr key={record._id}>
                                            <td>{index + 1}</td>
                                            <td>{record.date.split("T")[0]}</td>
                                            <td>{record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : "N/A"}</td>
                                            <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : "Not clocked out"}</td>
                                            <td>{formatHoursToHHMMSS(record.totalHours)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No attendance records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </Col>
                </Row>
            </Container>
        </AdminLayout>
    );
};

export default UserDashboard;