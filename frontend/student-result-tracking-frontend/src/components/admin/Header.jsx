import { useState } from "react";
import { FaUserShield } from "react-icons/fa";
import { Dropdown, Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Header({ activeTab }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const firstName = localStorage.getItem("firstName") || "Admin";
  const lastName = localStorage.getItem("lastName") || "User";
  const userName = `${firstName} ${lastName}`; 

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/");
  };

  const titles = {
    dashboard: "Dashboard Overview",
    students: "Student Management",
    lecturers: "Lecturer Management",
    courses: "Course Management",
    "assign-course": "Course Assignment",
    enrollments: "Enrollment Records",
    grades: "Grade Records",
    reports: "Reports Generation",
  };

  return (
    <>
      <header className="content-header d-flex justify-content-between align-items-center">
        <h3>{titles[activeTab] || "Dashboard"}</h3>
        <div className="user-info d-flex align-items-center">
          <span className="me-2">{userName}</span>
          <Dropdown>
            <Dropdown.Toggle
              variant="link"
              className="user-avatar border-0 shadow-none p-0"
            >
              <FaUserShield size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item onClick={() => navigate("/profile-management")}>
                Profile Management
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/change-password")}>
                Change Password
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                className="text-danger"
                onClick={() => setShowLogoutModal(true)}
              >
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header;
