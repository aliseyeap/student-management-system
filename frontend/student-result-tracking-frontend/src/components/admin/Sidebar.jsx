import { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { 
  FaTachometerAlt, FaUsers, FaChalkboardTeacher, FaBook, 
  FaChartBar, FaCog, FaBars, FaTimes, FaUserShield, 
  FaGraduationCap, FaClipboardList, FaFileAlt, FaUserCheck 
} from 'react-icons/fa';
import '../css/AdminDashboard.css';

function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header d-flex justify-content-between align-items-center">
        {!collapsed && <h4 className="m-0">Admin Panel</h4>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <Nav className="flex-column">
        <Nav.Link active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          <FaTachometerAlt className="icon" />
          {!collapsed && 'Dashboard'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'students'} onClick={() => setActiveTab('students')}>
          <FaGraduationCap className="icon" />
          {!collapsed && 'Students'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'lecturers'} onClick={() => setActiveTab('lecturers')}>
          <FaChalkboardTeacher className="icon" />
          {!collapsed && 'Lecturers'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}>
          <FaBook className="icon" />
          {!collapsed && 'Courses'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'assign-course'} onClick={() => setActiveTab('assign-course')}>
          <FaUserCheck className="icon" />
          {!collapsed && 'Assignment'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'enrollments'} onClick={() => setActiveTab('enrollments')}>
          <FaClipboardList className="icon" />
          {!collapsed && 'Enrollments'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'grades'} onClick={() => setActiveTab('grades')}>
          <FaFileAlt className="icon" />
          {!collapsed && 'Grades'}
        </Nav.Link>
        <Nav.Link active={activeTab === 'reports'} onClick={() => setActiveTab('reports')}>
          <FaChartBar className="icon" />
          {!collapsed && 'Reports'}
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
