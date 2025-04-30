import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify"; 

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      localStorage.setItem("role", response.role);
      toast.success("Login successful!");
      navigate(response.role === "admin" ? "/adminDashboard" : "/userDashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Login</h2>
          <Form onSubmit={handleSubmit}>
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
            <div className="d-grid mb-3">
              <Button variant="primary" type="submit">
                Login
              </Button>
            </div>
          </Form>

          <div className="text-center mt-3">
            <p>Not registered yet?</p>
            <Button
              variant="secondary"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
