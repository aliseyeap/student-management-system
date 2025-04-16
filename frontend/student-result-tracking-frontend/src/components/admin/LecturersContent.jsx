import { useState, useEffect } from "react";
import { Card, Table, Button, Badge, InputGroup, Form, FormControl, Alert } from "react-bootstrap";
import axios from "axios";
import LecturerModal from "./LecturerModal";

function LecturersContent() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [lecturers, setLecturers] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");
  const [lecturerData, setLecturerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    isActive: true,
  });

  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/admin/users/lecturers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers(response.data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleOpenModal = (lecturer = null) => {
    if (lecturer) {
      setEditMode(true);
      setSelectedLecturerId(lecturer.id);
      setLecturerData({
        firstName: lecturer.firstName,
        lastName: lecturer.lastName,
        email: lecturer.email,
        phoneNumber: lecturer.phoneNumber,
        isActive: lecturer.isActive,
      });
    } else {
      setEditMode(false);
      setLecturerData({
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

    console.log("Submitting form:", lecturerData);

    try {
      if (editMode) {
        const { password, ...updatedLecturerData } = lecturerData;
        await axios.patch(
          `http://localhost:8080/api/admin/users/${selectedLecturerId}/update`,
          updatedLecturerData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showAlert("Lecturer updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/admin/users/register/lecturer",
          lecturerData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showAlert("New lecturer added successfully!");
      }

      fetchLecturers();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting lecturer data:", error);
      showAlert("An error occurred. Please try again.", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecturer?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("Lecturer deleted successfully!", "warning");
      fetchLecturers();
    } catch (error) {
      console.error("Error deleting lecturer:", error);
      showAlert("Failed to delete lecturer.", "danger");
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
      fetchLecturers();
      showAlert(`Lecturer has been successfully ${!isActive ? "activated" : "deactivated"}!`);
    } catch (error) {
      console.error("Error updating lecturer status:", error);
      showAlert("Failed to update lecturer status.", "danger");
    }
  };

  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      (lecturer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.lastName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" ||
        (lecturer.isActive ? "Active" : "Inactive") === statusFilter)
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
        <Button variant="primary" onClick={() => handleOpenModal()}>Add New Lecturer</Button>
      </div>

      <Card>
        <Card.Header>List of Lecturers</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Lecturer ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredLecturers.length > 0 ? (
              filteredLecturers.map((lecturer) => (
                <tr key={lecturer.id}>
                  <td>{lecturer.employeeId}</td>
                  <td>{lecturer.firstName}</td>
                  <td>{lecturer.lastName}</td>
                  <td>{lecturer.email}</td>
                  <td>{lecturer.phoneNumber}</td>
                  <td>
                    <Badge bg={lecturer.isActive ? "success" : "danger"}>
                      {lecturer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-warning" size="sm" className="me-2"
                        onClick={() => handleToggleStatus(lecturer.id, lecturer.isActive)}>
                        {lecturer.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline-info" size="sm" className="me-2"
                        onClick={() => handleOpenModal(lecturer)}>
                        Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(lecturer.id)}>
                        Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No lecturers available.
                </td>
              </tr>
            )}
          </tbody>
          </Table>
        </Card.Body>
      </Card>

      <LecturerModal show={showModal} handleClose={handleCloseModal} handleSubmit={handleSubmit} lecturerData={lecturerData} setLecturerData={setLecturerData} editMode={editMode} />
    </>
  );
}

export default LecturersContent;
