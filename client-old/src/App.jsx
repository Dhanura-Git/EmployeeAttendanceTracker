import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import UserDashboard from "./components/UserAuthenticated/UserDashboard";
import AdminDashboard from "./components/AdminAuthenticated/AdminDashboard";
import Home from "./pages/Home";

function App() {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/userDashboard" element={<UserDashboard />} />
                <Route path="/adminDashboard" element={<AdminDashboard />}/>
            </Routes>
    );
}

export default App;
