import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { submitLeaveRequestForDates } from '../../services/attendanceService'; // 👈 custom function
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify'; // Import toast for notifications

import AdminLayout from "./userLayout";

const LeaveRequestPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [leaveReason, setLeaveReason] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || endDate < startDate) {
      toast.warning('Please provide a valid date range.');
      return;
    }

    try {
      // Generate all dates between startDate and endDate
      const leaveDates = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        leaveDates.push(new Date(currentDate)); // Add each date to the array
        currentDate.setDate(currentDate.getDate() + 1); // Increment the date by 1
      }

      const res = await submitLeaveRequestForDates(leaveDates, reason, leaveReason);

      toast.success(res.message || 'Leave requested!');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <AdminLayout>
      <Container className="mt-4">
        <h3 className="mb-4">Request Leave (Upcoming Days)</h3>

        <Card className="p-4 shadow-sm">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
                className="form-control"
                placeholderText="Select start date"
                dateFormat="yyyy-MM-dd"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate || new Date()}
                className="form-control"
                placeholderText="Select end date"
                dateFormat="yyyy-MM-dd"
              />
            </Form.Group>

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
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Submit Request
            </Button>
          </Form>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default LeaveRequestPage;
