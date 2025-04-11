import { useEffect, useState } from "react";
import { fetchUsers, updateUserSalary } from "../../services/authService"; // You'll create this service
import { Table, Form, Button, Container } from "react-bootstrap";
import { toast } from "react-toastify";


const AdminSalary = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetchUsers();
            setUsers(response);

            // Initialize form data for each user
            const initialForm = {};
            response.forEach(user => {
                initialForm[user._id] = {
                    salary: user.salary || "",
                    salaryPayDate: user.salaryPayDate
                        ? new Date(user.salaryPayDate).toISOString().split("T")[0]
                        : ""
                };
            });
            setFormData(initialForm);
        } catch (error) {
            toast.error("Failed to fetch users");
        }
    };

    const handleChange = (userId, field, value) => {
        setFormData(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value
            }
        }));
    };

    const handleSave = async (userId) => {
        const { salary, salaryPayDate } = formData[userId];
        try {
            await updateUserSalary(userId, { salary, salaryPayDate });
            toast.success("Salary details updated");
            loadUsers();
        } catch (error) {
            toast.error("Failed to update salary details");
        }
    };

    return (
        <Container className="mt-4">
            <h2>Manage Salaries</h2>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Salary</th>
                        <th>Salary Pay Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.designation}</td>
                            <td>
                                <Form.Control
                                    type="number"
                                    value={formData[user._id]?.salary || ""}
                                    onChange={e => handleChange(user._id, "salary", e.target.value)}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    type="date"
                                    value={formData[user._id]?.salaryPayDate || ""}
                                    onChange={e => handleChange(user._id, "salaryPayDate", e.target.value)}
                                />
                            </td>
                            <td>
                                <Button variant="success" size="sm" onClick={() => handleSave(user._id)}>
                                    Save
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminSalary;
