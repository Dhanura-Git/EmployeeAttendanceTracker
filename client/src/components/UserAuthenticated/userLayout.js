import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "./userSidebar";
import Topbar from "./userTopbar";
import "../../adminLayoutCss.css";

const AdminLayout = ({ children }) => {
  return (
    <Container fluid style={{
      boxShadow: '0 0 0 15px #f0f0f0', // creates a "colored margin"
      backgroundColor: '#f0f0f0',
    }}>
      <Row>
        <Col md={2} className="p-0">
          <Sidebar />
        </Col>
        <Col md={10} className="p-0">
          <Topbar />
          <div className="p-4">{children}</div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
