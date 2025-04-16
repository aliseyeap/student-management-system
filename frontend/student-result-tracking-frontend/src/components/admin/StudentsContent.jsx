import { useState, useEffect } from "react";
import { Card, Table, Button, Badge, InputGroup, Form, FormControl, Alert } from "react-bootstrap";
import axios from "axios";
import StudentModal from "./StudentModal";

function StudentsContent() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [students, setStudents] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    isActive: true,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/admin/users/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditMode(true);
      setSelectedStudentId(student.id);
      setStudentData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        isActive: student.isActive,
      });
    } else {
      setEditMode(false);
      setStudentData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    console.log("Submitting form:", studentData);

    try {
      if (editMode) {
        // Exclude password field before sending update request
        const { password, ...updatedStudentData } = studentData;

        await axios.patch(
          `http://localhost:8080/api/admin/users/${selectedStudentId}/update`,
          updatedStudentData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showAlert("Student updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/admin/users/register/student",
          studentData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showAlert("New student added successfully!");
      }

      fetchStudents();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting student data:", error);
      showAlert("An error occurred. Please try again.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("Student deleted successfully!", "warning");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      showAlert("Failed to delete student.", "danger");
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8080/api/admin/users/${id}/update`,
        { isActive: !isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchStudents();
      showAlert(`Student has been successfully ${!isActive ? "activated" : "deactivated"}!`);
    } catch (error) {
      console.error("Error updating student status:", error);
      showAlert("Failed to update student status.", "danger");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" ||
        (student.isActive ? "Active" : "Inactive") === statusFilter)
  );

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="me-3" style={{ width: "200px" }}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
          <InputGroup className="me-2" style={{ width: "800px" }}>
            <FormControl type="text" placeholder="Search by first name or last name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>Add New Student</Button>
      </div>

      <Card>
        <Card.Header>List of Students</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.firstName}</td>
                  <td>{student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.phoneNumber}</td>
                  <td>
                    <Badge bg={student.isActive ? "success" : "danger"}>
                      {student.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleToggleStatus(student.id, student.isActive)}
                    >
                      {student.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenModal(student)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No students available.
                </td>
              </tr>
            )}
          </tbody>
          </Table>
        </Card.Body>
      </Card>

      <StudentModal show={showModal} handleClose={handleCloseModal} handleSubmit={handleSubmit} studentData={studentData} setStudentData={setStudentData} editMode={editMode} />
    </>
  );
}

export default StudentsContent;
