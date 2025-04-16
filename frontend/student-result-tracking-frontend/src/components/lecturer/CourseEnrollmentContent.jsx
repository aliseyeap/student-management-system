import { useState, useEffect } from "react";
import { Card, Table, InputGroup, Form, FormControl, Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";
import dayjs from "dayjs";

const CourseEnrollmentContent = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("danger");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchType, setSearchType] = useState("student"); // Default: search by student

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:8080/api/lecturers/all-course-enrollments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEnrollments(response.data);

      // Fetch student details
      const uniqueStudentIds = [...new Set(response.data.map((e) => e.studentId))];
      fetchStudentDetails(uniqueStudentIds);

      // Fetch course details
      const uniqueCourseIds = [...new Set(response.data.map((e) => e.courseId))];
      fetchCourseDetails(uniqueCourseIds);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const fetchCourseDetails = async (courseIds) => {
    const token = localStorage.getItem("token");

    try {
      const coursePromises = courseIds.map((id) =>
        axios.get(`http://localhost:8080/api/lecturers/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const results = await Promise.all(coursePromises);
      const courseMap = {};
      results.forEach((res) => {
        courseMap[res.data.id] = res.data.courseCode;
      });

      setCourses(courseMap);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const fetchStudentDetails = async (studentIds) => {
    const token = localStorage.getItem("token");

    try {
      const studentPromises = studentIds.map((id) =>
        axios.get(`http://localhost:8080/api/lecturers/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const results = await Promise.all(studentPromises);
      const studentMap = {};

      results.forEach((res) => {
        studentMap[res.data.id] = res.data.studentId;
      });

      setStudents(studentMap);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const showAlert = (message, variant = "danger") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const formatDateTime = (datetime) => {
    return datetime ? dayjs(datetime).format("YYYY-MM-DD HH:mm:ss") : "N/A";
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "enrolled":
        return <Badge bg="success">Enrolled</Badge>;
      case "dropped":
        return <Badge bg="danger">Dropped</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const handleDropStudent = async (studentId, courseId) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.post(
        "http://localhost:8080/api/lecturers/drop-student",
        null, 
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { studentId, courseId }, 
        }
      );
  
      showAlert(response.data, "warning");
      fetchEnrollments(); 
    } catch (error) {
      console.error("Error dropping student:", error);
      showAlert(error.response?.data || "Failed to drop student.", "danger");
    }
  };

  const handleReEnrollStudent = async (studentId, courseId) => {
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.patch(
        "http://localhost:8080/api/lecturers/re-enroll-student",
        null, 
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { studentId, courseId },
        }
      );
  
      showAlert(response.data, "success");
      fetchEnrollments(); 
    } catch (error) {
      console.error("Error re-enrolling student:", error);
      showAlert(error.response?.data || "Failed to re-enroll student.", "danger");
    }
  };
  

  const filteredEnrollments = enrollments
  .filter((enrollment) => statusFilter === "All" || enrollment.status.toLowerCase() === statusFilter.toLowerCase())
  .filter((enrollment) => {
    if (!searchTerm) return true;

    const studentId = students[enrollment.studentId]?.toLowerCase() || "";
    const studentName = enrollment.studentName?.toLowerCase() || "";
    const courseCode = courses[enrollment.courseId]?.toLowerCase() || "";
    const courseName = enrollment.courseName?.toLowerCase() || "";

    if (searchType === "student") {
      return studentId.includes(searchTerm.toLowerCase()) || studentName.includes(searchTerm.toLowerCase());
    } else {
      return courseCode.includes(searchTerm.toLowerCase()) || courseName.includes(searchTerm.toLowerCase());
    }
  })
  .sort((a, b) => {
    const dateA = a.droppedAt ? dayjs(a.droppedAt) : dayjs(a.enrolledAt);
    const dateB = b.droppedAt ? dayjs(b.droppedAt) : dayjs(b.enrolledAt);
    
    return dateB.diff(dateA);
  });

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          {/* Status Filter Dropdown */}
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="me-3" style={{ width: "200px" }}>
            <option value="All">All</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Dropped">Dropped</option>
          </Form.Select>

          {/* Search By Type Selector */}
          <Form.Select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="me-3" style={{ width: "200px" }}>
            <option value="student">Search by Student</option>
            <option value="course">Search by Course</option>
          </Form.Select>

          {/* Search Input */}
          <InputGroup style={{ width: "600px" }}>
            <FormControl
              type="text"
              placeholder={`Search by ${searchType === "student" ? "Student ID or Name" : "Course Code or Name"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <Card>
        <Card.Header>Student Enrollments</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Status</th>
                <th>Enrolled At</th>
                <th>Dropped At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{students[enrollment.studentId] || "Loading..."}</td>
                    <td>{enrollment.studentName}</td>
                    <td>{courses[enrollment.courseId] || "Loading..."}</td>
                    <td>{enrollment.courseName}</td>
                    <td>{getStatusBadge(enrollment.status)}</td>
                    <td>{formatDateTime(enrollment.enrolledAt)}</td>
                    <td>{enrollment.droppedAt ? formatDateTime(enrollment.droppedAt) : <Badge bg="info">Still Enrolled</Badge>}</td>
                    <td>
                      {enrollment.status === "ENROLLED" ? (
                        <Button variant="outline-danger" size="sm" onClick={() => handleDropStudent(enrollment.studentId, enrollment.courseId)}>
                          Drop Student
                        </Button>
                      ) : (
                        <Button variant="outline-success" size="sm" onClick={() => handleReEnrollStudent(enrollment.studentId, enrollment.courseId)}>
                          Re-Enroll Student
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">No enrollments available.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
};

export default CourseEnrollmentContent;
