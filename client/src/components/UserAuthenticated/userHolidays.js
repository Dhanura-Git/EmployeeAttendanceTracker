import { useState, useEffect } from "react";
import { getHolidays } from "../../services/holidayService";
import { Container, Row, Col } from 'react-bootstrap';
import AdminLayout from "./userLayout";

const UserHolidays = () => {
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);

    useEffect(() => {
        const checkHolidayToday = async () => {
            try {
                const holidays = await getHolidays();
                const todayDate = new Date().toLocaleDateString();

                const todayHoliday = holidays.find(holiday => {
                    const holidayDate = new Date(holiday.date).toLocaleDateString();
                    return holidayDate === todayDate;
                });


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

    return (
        <AdminLayout>
            <Container className="mt-4">
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
            </Container>
        </AdminLayout>
    );
};

export default UserHolidays;