import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify'; // Import toast for notifications

const Signup = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "employee",          
        designation: ""
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: value, 
            ...(name === "role" && { designation: "" }) 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(formData);
            toast.success("Signup successful! Please login.");
            navigate("/login");
        } catch (error) {
            toast.error(error.response.data.message || "Signup failed");
        }
    };

    const getDesignationOptions = () => {
        if (formData.role === "admin") {
            return ["COO"];
        }
        return ["Developer", "Designer", "HR", "Manager", "QA"];
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h2 className="text-center mb-4">Signup</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                name="username"
                                placeholder="Username"
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Select 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Select 
                                name="designation" 
                                value={formData.designation} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Designation</option>
                                {getDesignationOptions().map((designation) => (
                                    <option key={designation} value={designation}>{designation}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="d-grid">
                            <Button variant="primary" type="submit">
                                Signup
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Signup;
