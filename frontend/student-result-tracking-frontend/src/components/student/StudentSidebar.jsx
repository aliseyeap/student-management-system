import { useState } from "react";
import { Nav } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaBook,
  FaChartBar,
  FaUserTie,
  FaBars,
  FaTimes
} from "react-icons/fa";
import "../css/StudentDashboard.css";

function StudentSidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`student-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="student-sidebar-header d-flex justify-content-between align-items-center">
        {!collapsed && <h4 className="m-0">Student Portal</h4>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <Nav className="flex-column">
        <Nav.Link active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
          <FaTachometerAlt className="icon" />
          {!collapsed && "Dashboard"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "enrollment"} onClick={() => setActiveTab("enrollment")}>
          <FaBook className="icon" />
          {!collapsed && "Course Enrollment"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "academics"} onClick={() => setActiveTab("academics")}>
          <FaChartBar className="icon" />
          {!collapsed && "Academic Records"}
        </Nav.Link>
        
        <Nav.Link active={activeTab === "lecturers"} onClick={() => setActiveTab("lecturers")}>
          <FaUserTie className="icon" />
          {!collapsed && "Lecturers"}
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default StudentSidebar;