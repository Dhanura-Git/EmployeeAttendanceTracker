import { useState, useEffect } from "react";
import { markClockIn, markClockOut, submitLeaveRequest, fetchUserAttendance, checkClockInStatus } from "../../services/attendanceService";
import { getHolidays } from "../../services/holidayService";
import { Container, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

                const futureHolidays = holidays
                    .filter(holiday => new Date(holiday.date) > new Date())
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

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
            const month = today.getMonth() + 1;
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
                    const todayDay = today.getDate();

                    const salaryPayDay = parseInt(data.salaryPayDate, 10);

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

        const totalSeconds = Math.round(parseFloat(hours) * 3600);

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
                toast.success("Successfully clocked in!");
            } else {
                toast.error(response.message || "Clock-in failed. Please try again.");
            }
        } catch (error) {
            console.error("Clock-in failed:", error);
            toast.error("Clock-in failed. Please try again.");
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
                toast.success("Successfully clocked out!");
            } else {
                toast.error(response.message || "Clock-out failed. Please try again.");
            }
        } catch (error) {
            console.error("Clock-out is failed:", error);
            toast.error("Clock-out failed. Please try again.");
        }
    };

    const handleSubmitLeave = async () => {
        if (!leaveReason) {
            toast.warn("Please select a leave type.");
            return;
        }

        const finalLeaveReason = leaveReason === "half_day" ? halfDayType : leaveReason;

        if (!finalLeaveReason) {
            toast.warn("Please select a valid Half Day type.");
            return;
        }

        try {
            const response = await submitLeaveRequest(finalLeaveReason);
            if (response.success) {
                setShowLeaveModal(false);
                toast.success("Leave request submitted successfully!");
            } else {
                toast.error(response.message || "Failed to submit leave request.");
            }
        } catch (error) {
            console.error("Leave submission failed:", error);
            toast.error("Failed to submit leave request. Try again.");
        }
    };

    return (
        <AdminLayout>
            <Container className="mt-4">
                <ToastContainer position="bottom-right" autoClose={2000} />
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center">
                            <h2>Welcome, User</h2>
                        </div>
                    </Col>
                </Row>

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
                <Row className="mb-4 justify-content-center">
                    <Col md="auto">
                        <h5 className="text-center">{currentTime.toLocaleString()}</h5>
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
                        <h4 className="text-primary">Attendance Chart</h4>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Col>
                </Row>

            </Container>
        </AdminLayout>
    );
};

export default UserDashboard;
