import { useState } from "react";
import { Nav } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaClipboardCheck,
  FaFileAlt,
  FaBars,
  FaTimes,
  FaUsers
} from "react-icons/fa";
import "../css/LecturerDashboard.css";

function LecturerSidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`lecturer-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="lecturer-sidebar-header d-flex justify-content-between align-items-center">
        {!collapsed && <h4 className="m-0">Lecturer Panel</h4>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <Nav className="flex-column">
        <Nav.Link active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
          <FaTachometerAlt className="icon" />
          {!collapsed && "Dashboard"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "students"} onClick={() => setActiveTab("students")}>
          <FaUsers className="icon" />
          {!collapsed && "Students"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "courses"} onClick={() => setActiveTab("courses")}>
          <FaChalkboardTeacher className="icon" />
          {!collapsed && "Courses"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "enrollment"} onClick={() => setActiveTab("enrollment")}>
          <FaUserGraduate className="icon" />
          {!collapsed && "Enrollments"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "grade"} onClick={() => setActiveTab("grade")}>
          <FaClipboardCheck className="icon" />
          {!collapsed && "Grades"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>
          <FaFileAlt className="icon" />
          {!collapsed && "Reports"}
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default LecturerSidebar;
