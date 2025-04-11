import { Link } from "react-router-dom";
import { Button, Container, Row, Col } from 'react-bootstrap';

const Home = () => {
    return (
        <Container className="mt-5 text-center">
            <Row className="justify-content-md-center">
                <Col md={8}>
                    <h1>Welcome to the Employee Attendance Tracker</h1>
                    <p className="lead mt-3 mb-4">Please sign up or log in to continue.</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/signup">
                            <Button variant="primary">Sign Up</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline-primary">Log In</Button>
                        </Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;