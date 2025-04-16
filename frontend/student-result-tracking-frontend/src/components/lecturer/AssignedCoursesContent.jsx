import { useState, useEffect } from "react";
import { Card, Table, InputGroup, FormControl, Alert, Form, Button } from "react-bootstrap";
import axios from "axios";
import EnrollStudentModal from "./EnrollStudentModal"; 

const AssignedCoursesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    fetchAssignedCourses();
    fetchStudents();
  }, []);

  const fetchAssignedCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/lecturers/assigned-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedCourses(response.data);
    } catch (error) {
      console.error("Error fetching assigned courses:", error);
      showAlert("Failed to load assigned courses.", "danger");
    }
  };

  const fetchStudents = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }
  
    try {
      const studentsResponse = await axios.get("http://localhost:8080/api/lecturers/users/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const enrollmentsResponse = await axios.get("http://localhost:8080/api/lecturers/all-course-enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const allStudents = studentsResponse.data;
      const enrollments = enrollmentsResponse.data;
  
      const enrolledStudentIds = enrollments
        .filter(enrollment => enrollment.courseId === courseId)
        .map(enrollment => enrollment.studentId);
  
      const availableStudents = allStudents.filter(student => !enrolledStudentIds.includes(student.id));
  
      setStudents(availableStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      showAlert("Failed to load students.", "danger");
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const getCourseStatus = (course) => {
    return course.enrolledStudents >= course.maxStudents ? "Full" : "Available";
  };

  const filteredCourses = assignedCourses.filter(course => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Full" && getCourseStatus(course) === "Full") ||
      (statusFilter === "Available" && getCourseStatus(course) === "Available");

    return matchesSearch && matchesStatus;
  });

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setSelectedStudentId("");
    fetchStudents(course.id);  
    setShowModal(true);
  };

  const handleEnrollStudent = async () => {
    if (!selectedStudentId || !selectedCourse) {
      showAlert("Please select a student.", "warning");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:8080/api/lecturers/enroll-new-student",
        null, // No request body needed for this API
        {
          params: {
            studentId: selectedStudentId,
            courseId: selectedCourse.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      showAlert(response.data, "success");
      setShowModal(false);
      fetchAssignedCourses(); // Refresh course list after enrollment
    } catch (error) {
      console.error("Error enrolling student:", error);
      showAlert("Failed to enroll student.", "danger");
    }
  };

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="me-3" style={{ width: "200px" }}>
            <option value="All">All</option>
            <option value="Full">Full</option>
            <option value="Available">Available</option>
          </Form.Select>
          <InputGroup className="me-2" style={{ width: "800px" }}>
            <FormControl type="text" placeholder="Search by course code, name, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
        </div>        
      </div>

      <Card>
        <Card.Header>List of Assigned Courses</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th className="w-10">Description</th>
                <th>Category</th>
                <th>Capacity</th>
                <th>Enrolled Students</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseName}</td>
                    <td style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word" }}>
                      {course.courseDescription}
                    </td>
                    <td>{course.category}</td>
                    <td>{course.maxStudents}</td>
                    <td>{course.enrolledStudents}</td>
                    <td>
                      <span className={`badge ${getCourseStatus(course) === "Full" ? "bg-danger" : "bg-success"}`}>
                        {getCourseStatus(course)}
                      </span>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleEnrollClick(course)}
                        disabled={getCourseStatus(course) === "Full"}
                      >
                        Enroll Student
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">No assigned courses found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <EnrollStudentModal show={showModal} onClose={() => setShowModal(false)} course={selectedCourse} students={students} selectedStudentId={selectedStudentId} setSelectedStudentId={setSelectedStudentId} handleEnrollStudent={handleEnrollStudent} />
    </>
  );
};

export default AssignedCoursesContent;
