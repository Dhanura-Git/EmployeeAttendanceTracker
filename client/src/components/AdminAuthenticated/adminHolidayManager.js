import { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Table, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addHoliday, getHolidays, deleteHoliday } from "../../services/holidayService";
import AdminLayout from "./adminLayout";

const AdminHolidayManager = () => {
    const [date, setDate] = useState(null);
    const [remark, setRemark] = useState("");
    const [holidays, setHolidays] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const data = await getHolidays();
            setHolidays(data);
        } catch (err) {
            setError("Failed to load holidays");
        }
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!date || !remark) {
            setError("Please select a date and enter a remark");
            return;
        }

        try {
            await addHoliday({ date, remark });
            setSuccess("Holiday added successfully");
            setDate(null);
            setRemark("");
            fetchHolidays();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add holiday");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this holiday?")) return;

        try {
            await deleteHoliday(id);
            fetchHolidays();
        } catch {
            setError("Failed to delete holiday");
        }
    };

    return (
        <AdminLayout>
            <Container className="mt-4">
                <Row className="mb-4">
                    <Col>
                        <h2>Holiday Manager</h2>
                    </Col>
                </Row>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleAddHoliday}>
                    <Row className="align-items-end">
                        <Col md={4}>
                            <Form.Group controlId="datePicker">
                                <Form.Label>Select Date</Form.Label>
                                <DatePicker
                                    selected={date}
                                    onChange={(date) => setDate(date)}
                                    minDate={new Date()}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                    placeholderText="Pick a holiday date"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="holidayRemark">
                                <Form.Label>Remark</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Enter holiday remark"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Button type="submit" variant="success" className="w-100">Add Holiday</Button>
                        </Col>
                    </Row>
                </Form>

                <h4 className="mt-5">Marked Holidays</h4>
                <Table striped bordered hover responsive className="mt-3">
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
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(holiday._id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </AdminLayout>
    );
};

export default AdminHolidayManager;
