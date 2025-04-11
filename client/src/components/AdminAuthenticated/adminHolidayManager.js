import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addHoliday, getHolidays, deleteHoliday } from "../../services/holidayService";

const AdminHolidayManager = () => {
    const [date, setDate] = useState(null);
    const [remark, setRemark] = useState("");
    const [holidays, setHolidays] = useState([]);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const data = await getHolidays();
            setHolidays(data);
        } catch (err) {
            alert("Failed to load holidays");
        }
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        if (!date || !remark) return alert("Please select a date and add a remark");

        try {
            await addHoliday({ date, remark });
            alert("Holiday added successfully");
            setDate(null);
            setRemark("");
            fetchHolidays();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add holiday");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
        try {
            await deleteHoliday(id);
            fetchHolidays();
        } catch {
            alert("Failed to delete holiday");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col><h2>Holiday Manager</h2></Col>
            </Row>

            <Form onSubmit={handleAddHoliday}>
                <Row>
                    <Col md={4}>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            minDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                            placeholderText="Select a future date"
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Control
                            type="text"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter holiday remark"
                        />
                    </Col>
                    <Col md={4}>
                        <Button type="submit" variant="success">Add Holiday</Button>
                    </Col>
                </Row>
            </Form>

            <h4 className="mt-4">Marked Holidays</h4>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Remark</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {holidays.map((holiday) => (
                        <tr key={holiday._id}>
                            <td>{new Date(holiday.date).toLocaleDateString()}</td>
                            <td>{holiday.remark}</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(holiday._id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminHolidayManager;
