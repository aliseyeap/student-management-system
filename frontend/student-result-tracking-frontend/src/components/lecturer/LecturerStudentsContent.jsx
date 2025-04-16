import { useState, useEffect } from "react";
import { Card, Table, Badge, InputGroup, Form, FormControl } from "react-bootstrap";
import axios from "axios";

function LecturerStudentsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [students, setStudents] = useState([]);

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
      const studentsResponse = await axios.get("http://localhost:8080/api/lecturers/users/students", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(studentsResponse.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All" || (student.isActive ? "Active" : "Inactive") === statusFilter)
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Form.Select>
          <InputGroup className="me-2" style={{ width: "800px" }}>
            <FormControl
              type="text"
              placeholder="Search by first name or last name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
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
                    <td>{student.phoneNumber || "N/A"}</td>
                    <td>
                      <Badge bg={student.isActive ? "success" : "danger"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No students available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}

export default LecturerStudentsContent;
