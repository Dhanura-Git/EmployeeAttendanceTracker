import React from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="sidebar-wrapper p-3">
            <h3 className="mb-4">EmployeeTracker</h3>
            <Nav className="flex-column">
                <Nav.Item>
                    <NavLink to="/adminDashboard" className="nav-link" activeClassName="active">
                        Dashboard
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/adminUsers" className="nav-link" activeClassName="active">
                        Users
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/adminHolidayManager" className="nav-link" activeClassName="active">
                        Holidays
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/adminSalary" className="nav-link" activeClassName="active">
                        Salary
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/adminReport" className="nav-link" activeClassName="active">
                        Reports
                    </NavLink>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
