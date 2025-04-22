import { useState, useEffect } from "react";
import { fetchUserAttendance } from "../../services/attendanceService";
import { Container, Row, Col} from 'react-bootstrap';

import AdminLayout from "./userLayout";

const UserReport = () => {
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const today = new Date();
            const month = today.getMonth() + 1; // JavaScript months are 0-based
            const year = today.getFullYear();

            const data = await fetchUserAttendance(month, year);
            setAttendance(data);         
        };
        fetchAttendanceData();
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



    return (
        <AdminLayout>
            <Container className="mt-4">
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

export default UserReport;