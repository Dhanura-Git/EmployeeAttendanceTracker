import { Routes, Route } from "react-router-dom";
import Signup from "./components/signup";
import Login from "./components/login";
import UserDashboard from "./components/UserAuthenticated/userDashboard";
import AdminDashboard from "./components/AdminAuthenticated/adminDashboard";
import Home from "./pages/home";
import UserSettings from "./components/UserAuthenticated/userSettings";
import AdminSettings from "./components/AdminAuthenticated/adminSettings";
import AdminHolidayManager from "./components/AdminAuthenticated/adminHolidayManager";
import AdminSalary from "./components/AdminAuthenticated/adminSalary";
import AdminLayout from "./components/AdminAuthenticated/adminLayout";
import AdminUsers from "./components/AdminAuthenticated/adminUsers";
import UserHolidays from "./components/UserAuthenticated/userHolidays";
import UserReport from "./components/UserAuthenticated/userReport";
import AdminReport from "./components/AdminAuthenticated/adminReport";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/userDashboard" element={<UserDashboard />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
                <Route path="/userSettings" element={<UserSettings />} />
                <Route path="/AdminSettings" element={<AdminSettings />} />
                <Route path="/adminHolidayManager" element={<AdminHolidayManager />} />
                <Route path="/adminSalary" element={<AdminSalary />} />
                <Route path="/adminLayout" element={<AdminLayout />} />
                <Route path="/adminUsers" element={<AdminUsers />} />
                <Route path="/userHolidays" element={<UserHolidays />} />
                <Route path="/userReport" element={<UserReport />} />
                <Route path="/adminReport" element={<AdminReport />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;


// import { Routes, Route } from "react-router-dom";
// import Signup from "./components/signup";
// import Login from "./components/login";
// import UserDashboard from "./components/UserAuthenticated/userDashboard";
// import Home from "./pages/home";
// import UserSettings from "./components/UserAuthenticated/userSettings";

// // 🔁 Layout component for Admin
// import AdminLayoutDashboard from "./components/AdminAuthenticated/adminlayoutDashboard";

// // 🔁 Admin pages
// import AdminDashboard from "./components/AdminAuthenticated/adminDashboard";
// import AdminSettings from "./components/AdminAuthenticated/adminSettings";
// import AdminHolidayManager from "./components/AdminAuthenticated/adminHolidayManager";
// import AdminSalary from "./components/AdminAuthenticated/adminSalary";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// function App() {
//     return (
//         <>
//             <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/signup" element={<Signup />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/userDashboard" element={<UserDashboard />} />
//                 <Route path="/userSettings" element={<UserSettings />} />

//                 {/* ✅ Nest admin routes inside layout */}
//                 <Route path="/admin" element={<AdminLayoutDashboard />}>
//                     <Route path="dashboard" element={<AdminDashboard />} />
//                     <Route path="settings" element={<AdminSettings />} />
//                     <Route path="holidays" element={<AdminHolidayManager />} />
//                     <Route path="salary" element={<AdminSalary />} />
//                 </Route>
//             </Routes>
//             <ToastContainer position="top-right" autoClose={3000} />
//         </>
//     );
// }

// export default App;
