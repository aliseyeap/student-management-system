import { useState, useEffect } from "react";
import { Card, Table, Button, InputGroup, FormControl, Alert, Badge, Form } from "react-bootstrap";
import axios from "axios";
import AssignCourseModal from "./AssignCourseModal";

function AssignCourseContent() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");

  // New state for filters
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [searchType, setSearchType] = useState("course"); 

  useEffect(() => {
    fetchCoursesWithLecturers();
    fetchLecturers();
  }, []);

  const fetchCoursesWithLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/admin/courses-assignment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/admin/users/lecturers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers(response.data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const handleAssignLecturer = async () => {
    if (!selectedLecturerId) {
      alert("Please select a lecturer.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!selectedCourseId || !selectedLecturerId) {
        console.error("Missing Course ID or Lecturer ID!");
        showAlert("Please select a course and a lecturer.", "danger");
        return;
      }
      
      await axios.post(
        `http://localhost:8080/api/admin/courses/${selectedCourseId}/assign-lecturer/${selectedLecturerId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCoursesWithLecturers();
      setShowModal(false);
      showAlert("Lecturer assigned successfully!", "success");
    } catch (error) {
      console.error("Error assigning lecturer:", error);
      showAlert("Failed to assign lecturer.", "danger");
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const filteredCourses = courses
  .filter((course) => {
    // Apply Status Filter
    if (statusFilter === "Assigned") return course.lecturerName && course.lecturerName !== "Not Assigned";
    if (statusFilter === "Unassigned") return !course.lecturerName || course.lecturerName === "Not Assigned";
    return true;
  })
  .map((course) => {
    if (searchTerm.trim() === "") return course; // No search applied, return full course

    if (searchType === "lecturer") {
      // Split lecturer names, emails, and phone numbers
      const lecturerNames = course.lecturerName ? course.lecturerName.split(", ") : [];
      const lecturerEmails = course.lecturerEmail ? course.lecturerEmail.split(", ") : [];
      const lecturerPhones = course.lecturerPhoneNumbers ? course.lecturerPhoneNumbers.split(", ") : [];

      // Find indexes of matching lecturers
      const matchedIndexes = lecturerNames.reduce((acc, name, index) => {
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) acc.push(index);
        return acc;
      }, []);

      if (matchedIndexes.length === 0) return null; // No matching lecturer, exclude course

      // Keep only the matched lecturers' details
      return {
        ...course,
        lecturerName: matchedIndexes.map((index) => lecturerNames[index]).join(", "),
        lecturerEmail: matchedIndexes.map((index) => lecturerEmails[index]).join(", "),
        lecturerPhoneNumbers: matchedIndexes.map((index) => lecturerPhones[index]).join(", "),
      };
    }

    if (searchType === "course") {
      return (
        (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
        ? course
        : null;
    }

    return course;
  })
  .filter(Boolean); // Remove null entries

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      {/* Filters and Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          {/* Status Filter Dropdown */}
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="All">All</option>
            <option value="Assigned">Assigned</option>
            <option value="Unassigned">Unassigned</option>
          </Form.Select>

          {/* Search By Type Selector */}
          <Form.Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="course">Search by Course</option>
            <option value="lecturer">Search by Lecturer</option>
          </Form.Select>

          {/* Search Input */}
          <InputGroup style={{ width: "600px" }}>
            <FormControl
              type="text"
              placeholder={`Search by ${searchType === "course" ? "Course Code or Name" : "Lecturer Name"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <Card>
        <Card.Header>Assign Course to Lecturer</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Status</th>
                <th>Assigned Lecturer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No course assignments available
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id || course.courseCode}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>
                    <Badge bg={course.lecturerName && course.lecturerName !== "Not Assigned" ? "success" : "danger"}>
                      {course.lecturerName && course.lecturerName !== "Not Assigned" ? "Assigned" : "Unassigned"}
                    </Badge>
                  </td>
                  <td>
                    {course.lecturerName && course.lecturerName !== "Not Assigned" ? (
                      <ul className="m-0 p-0" style={{ listStyleType: "none" }}>
                        {course.lecturerName.split(", ").map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul>
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </td>
                  <td>
                    {course.lecturerEmail && course.lecturerEmail !== "N/A" ? (
                      <ul className="m-0 p-0" style={{ listStyleType: "none" }}>
                        {course.lecturerEmail.split(", ").map((email, index) => (
                          <li key={index}>{email}</li>
                        ))}
                      </ul>
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </td>
                  <td>
                    {course.lecturerPhoneNumbers && course.lecturerPhoneNumbers !== "N/A" ? (
                      <ul className="m-0 p-0" style={{ listStyleType: "none" }}>
                        {course.lecturerPhoneNumbers.split(", ").map((phone, index) => (
                          <li key={index}>{phone}</li>
                        ))}
                      </ul>
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </td>
                  <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    disabled={!course.courseId}
                    onClick={() => {
                      setSelectedCourseId(course.courseId);
                      setShowModal(true);
                    }}
                  >
                    Assign Lecturer
                  </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </Table>
        </Card.Body>
      </Card>

      <AssignCourseModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        lecturers={lecturers}
        selectedLecturerId={selectedLecturerId}
        setSelectedLecturerId={setSelectedLecturerId}
        handleAssignLecturer={handleAssignLecturer}
        selectedCourse={courses.find(course => course.courseId === selectedCourseId)}
      />
    </>
  );
}

export default AssignCourseContent;
