import { useState, useEffect } from "react";
import { Card, Table, InputGroup, Form, FormControl, Alert, Badge } from "react-bootstrap";
import axios from "axios";

function GradesContent() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [searchType, setSearchType] = useState("student"); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("danger");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:8080/api/admin/all-student-grades", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGrades(response.data);

      // Fetch student and course details
      const uniqueStudentIds = [...new Set(response.data.map((g) => g.studentId))];
      const uniqueCourseIds = [...new Set(response.data.map((g) => g.courseId))];

      fetchStudentDetails(uniqueStudentIds);
      fetchCourseDetails(uniqueCourseIds);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchStudentDetails = async (userIds) => {
    const token = localStorage.getItem("token");

    try {
      const studentPromises = userIds.map((id) =>
        axios.get(`http://localhost:8080/api/admin/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const results = await Promise.all(studentPromises);
      const studentMap = {};

      results.forEach((res) => {
        studentMap[res.data.id] = {
          studentId: res.data.studentId,
          fullName: `${res.data.firstName} ${res.data.lastName}`,
        };
      });

      setStudents(studentMap);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const fetchCourseDetails = async (courseIds) => {
    const token = localStorage.getItem("token");

    try {
      const coursePromises = courseIds.map((id) =>
        axios.get(`http://localhost:8080/api/admin/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const results = await Promise.all(coursePromises);
      const courseMap = {};
      results.forEach((res) => {
        courseMap[res.data.id] = {
          courseCode: res.data.courseCode,
          courseName: res.data.courseName,
        };
      });

      setCourses(courseMap);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "success"; 
      case "B":
        return "primary"; 
      case "C":
        return "info"; 
      case "D":
        return "warning";
      case "F":
        return "dark"; 
      case "NA":
        return "secondary"; 
      default:
        return "secondary"; 
    }
  };

  // **Updated Filtering Logic**
  const filteredGrades = grades.filter((grade) => {
    const student = students[grade.studentId] || {};
    const course = courses[grade.courseId] || {};

    // Filter by selected grade
    if (selectedGrade && grade.finalGrade !== selectedGrade) {
      return false;
    }

    // Filter based on search type
    if (searchType === "student") {
      return (
        searchTerm === "" ||
        (student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else if (searchType === "course") {
      return (
        searchTerm === "" ||
        (course.courseCode && course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return true;
  });

  const sortedGrades = [...filteredGrades].sort((a, b) => {
    // If both grades are "NA", maintain order
    if (a.finalGrade === "NA" && b.finalGrade === "NA") return 0;
  
    // If only one of them is "NA", push it to the bottom
    if (a.finalGrade === "NA") return 1;
    if (b.finalGrade === "NA") return -1;
  
    // Sort normally by totalScore (or any other criteria)
    return (b.totalScore ?? 0) - (a.totalScore ?? 0);
  });

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
          {/* Grade Filter Dropdown */}
          <Form.Select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="">All Grades</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
            <option value="NA">NA</option>
          </Form.Select>

          {/* Search By Type Selector */}
          <Form.Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="student">Search by Student</option>
            <option value="course">Search by Course</option>
          </Form.Select>

          {/* Search Input */}
          <InputGroup style={{ width: "600px" }}>
            <FormControl
              type="text"
              placeholder={`Search by ${
                searchType === "student" ? "Student ID or Name" : "Course Code or Name"
              }...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <Card>
        <Card.Header>Student Grades</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Quiz Score</th>
                <th>Mid-Term Score</th>
                <th>Final Exam Score</th>
                <th>Total Score</th>
                <th>Final Grade</th>
              </tr>
            </thead>
            <tbody>
            {sortedGrades.length > 0 ? (
              sortedGrades.map((grade) => (
                <tr key={`${grade.studentId}-${grade.courseId}`}>
                  <td>{students[grade.studentId]?.studentId || "Loading..."}</td>
                  <td>{students[grade.studentId]?.fullName || "Loading..."}</td>
                  <td>{courses[grade.courseId]?.courseCode || "Loading..."}</td>
                  <td>{courses[grade.courseId]?.courseName || "Loading..."}</td>
                  <td>{grade.quizScore ?? <Badge bg="danger">Unassigned</Badge>}</td>
                  <td>{grade.midTermScore ?? <Badge bg="danger">Unassigned</Badge>}</td>
                  <td>{grade.finalExamScore ?? <Badge bg="danger">Unassigned</Badge>}</td>
                  <td>{grade.totalScore ?? <Badge bg="danger">Unassigned</Badge>}</td>
                  <td>
                    <Badge bg={getGradeColor(grade.finalGrade)}>
                      {grade.finalGrade === "NA" ? "N/A" : grade.finalGrade || "N/A"}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted">No grades available.</td>
              </tr>
            )}
          </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}

export default GradesContent;
