import { useState, useEffect } from "react";
import { Card, Table, InputGroup, Form, FormControl, Alert, Badge, Button } from "react-bootstrap";
import axios from "axios";
import GradeModal from "./GradeModal";

const GradeAssignmentContent = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [searchType, setSearchType] = useState("student"); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("danger");
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [newScores, setNewScores] = useState({ quizScore: "", midTermScore: "", finalExamScore: "" });
  const [selectedScoreType, setSelectedScoreType] = useState(""); 
  const [actionType, setActionType] = useState(''); 

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:8080/api/lecturers/all-student-grades", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGrades(response.data);

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
        axios.get(`http://localhost:8080/api/lecturers/students/${id}`, {
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
        axios.get(`http://localhost:8080/api/lecturers/courses/${id}`, {
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

  const filteredGrades = grades.filter((grade) => {
    const student = students[grade.studentId] || {};
    const course = courses[grade.courseId] || {};

    if (selectedGrade && grade.finalGrade !== selectedGrade) {
      return false;
    }

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

  const examTypeMapping = {
    quizScore: "quiz",
    midTermScore: "midterm",
    finalExamScore: "final"
  };

  const showAlert = (message, variant = "danger") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleAssignScore = async () => {
    if (!editingGrade || !selectedScoreType || newScores[selectedScoreType] === "") {
      throw new Error("Please select an exam type and enter a valid score.");
    }
  
    const examType = examTypeMapping[selectedScoreType];
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
  
    try {
      const response = await axios.post(
        `http://localhost:8080/api/lecturers/assign-grade?studentId=${editingGrade.studentId}&courseId=${editingGrade.courseId}&examType=${examType}&score=${newScores[selectedScoreType]}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      showAlert("Score assigned successfully!", "success");
      fetchGrades();
      closeModal();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to assign score. Student has dropped the course. Grade assignment is not allowed");
    }
  };
  
  const handleUpdateScore = async () => {
    if (!editingGrade || !selectedScoreType || newScores[selectedScoreType] === "") {
      throw new Error("Please select an exam type and enter a valid score.");
    }
  
    const examType = examTypeMapping[selectedScoreType];
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication required");
  
    try {
      const response = await axios.put(
        `http://localhost:8080/api/lecturers/update-grade?studentId=${editingGrade.studentId}&courseId=${editingGrade.courseId}&examType=${examType}&score=${newScores[selectedScoreType]}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      showAlert("Score updated successfully!", "success");
      fetchGrades();
      closeModal();
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update score. Student has dropped the course. Grade update is not allowed");
    }
  };

  const sortedGrades = [...filteredGrades].sort((a, b) => {
    if (a.finalGrade === "NA" && b.finalGrade === "NA") return 0;
    if (a.finalGrade === "NA") return 1;
    if (b.finalGrade === "NA") return -1;
  
    return (b.totalScore ?? 0) - (a.totalScore ?? 0);
  });

  const openModal = (grade, action) => {
    setEditingGrade(grade);
    setNewScores({
      quizScore: grade.quizScore ?? "",
      midTermScore: grade.midTermScore ?? "",
      finalExamScore: grade.finalExamScore ?? "",
    });
    setSelectedScoreType("");
    setShowModal(true);
    setActionType(action);  
  };
  
  
  const closeModal = () => {
    setShowModal(false);
    setEditingGrade(null);
    setNewScores({ quizScore: "", midTermScore: "", finalExamScore: "" });
  };

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">
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

          <Form.Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="me-3"
            style={{ width: "200px" }}
          >
            <option value="student">Search by Student</option>
            <option value="course">Search by Course</option>
          </Form.Select>

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
                <th>Actions</th>
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
                    <td><Badge bg={getGradeColor(grade.finalGrade)}>{grade.finalGrade || "N/A"}</Badge></td>
                    <td>
                      <div className="d-flex flex-column">
                        {/* If all scores are null, show only Assign Score */}
                        {grade.quizScore === null && grade.midTermScore === null && grade.finalExamScore === null ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="mb-1"
                            onClick={() => openModal(grade, 'assign')}
                          >
                            Assign Score
                          </Button>
                        ) : (
                          <>
                            {/* If some scores are null, show both Assign & Update Score */}
                            {!(grade.quizScore !== null && grade.midTermScore !== null && grade.finalExamScore !== null) && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="mb-1"
                                onClick={() => openModal(grade, 'assign')}
                              >
                                Assign Score
                              </Button>
                            )}
                            
                            {/* Always show Update Score if at least one score is assigned */}
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="mb-1"
                              onClick={() => openModal(grade, 'update')}
                            >
                              Update Score
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10" className="text-center text-muted">No grades available.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <GradeModal
        show={showModal}
        onHide={closeModal}
        grade={editingGrade}
        student={students[editingGrade?.studentId]} 
        course={courses[editingGrade?.courseId]} 
        scores={newScores}
        setScores={setNewScores}
        selectedScoreType={selectedScoreType}
        setSelectedScoreType={setSelectedScoreType}
        actionType={actionType}  // Pass the actionType
        handleAssignScore={handleAssignScore}
        handleUpdateScore={handleUpdateScore}
      />
    </>
  );
};

export default GradeAssignmentContent;
