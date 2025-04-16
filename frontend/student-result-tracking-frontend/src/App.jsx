import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/common/Login";
import ForgotPassword from "./components/common/ForgotPassword";
import ResetPassword from "./components/common/ResetPassword";
import ProfileManagement from "./components/common/ProfileManagement";
import ChangePassword from "./components/common/ChangePassword";
import AdminDashboard from "./components/admin/adminDashboard";
import LecturerDashboard from "./components/lecturer/lecturerDashboard";
import StudentDashboard from "./components/student/studentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["LECTURER"]} />}>
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* General functions */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile-management" element={<ProfileManagement />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
