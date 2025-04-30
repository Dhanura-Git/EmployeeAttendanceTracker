import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar-wrapper p-3">
            <div className="text-center mb-4 mt-1">
                <img 
                    src="/logo.png" 
                    alt="Employee Attendance Tracker Logo" 
                    style={{ maxWidth: "100%", height: "auto", maxHeight: "60px" }} 
                />
            </div>
            <Nav className="flex-column">
                <Nav.Item>
                    <NavLink to="/userDashboard" className="nav-link" activeClassName="active">
                        Dashboard
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/userHolidays" className="nav-link" activeClassName="active">
                        Holidays
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/leaveRequestPage" className="nav-link" activeClassName="active">
                        Leave Request
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/userReport" className="nav-link" activeClassName="active">
                        Reports
                    </NavLink>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
