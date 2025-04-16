import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const ReportGenerationContent = () => {
  const [selectedReport, setSelectedReport] = useState("students");
  const [data, setData] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchData();
  }, [selectedReport, filterOption, selectedCourse]);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/lecturers/assigned-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Convert courses array to map for easy lookup
      const courseMap = response.data.reduce((acc, course) => {
        acc[course.id] = {
          courseCode: course.courseCode,
          courseName: course.courseName,
        };
        return acc;
      }, {});
      setCourses(courseMap);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    let url = "";
    let fetchStudents = false;
  
    setIsLoading(true);
  
    try {
      switch (selectedReport) {
        case "students":
          url = "http://localhost:8080/api/lecturers/users/students";
          break;
        case "courses":
          url = "http://localhost:8080/api/lecturers/assigned-courses";
          break;
        case "enrollments":
          fetchStudents = true;
          url = filterOption === "specific" && selectedCourse
            ? `http://localhost:8080/api/lecturers/course-enrollments?courseId=${selectedCourse}`
            : "http://localhost:8080/api/lecturers/all-course-enrollments";
          break;
        case "grades":
          fetchStudents = true;
          url = filterOption === "specific" && selectedCourse
            ? `http://localhost:8080/api/lecturers/course/${selectedCourse}/student-grades`
            : "http://localhost:8080/api/lecturers/all-student-grades";
          break;
        default:
          return;
      }
  
      if (fetchStudents) {
        await fetchStudentsAndCourses(token);
      }
  
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
      
    } catch (error) {
      console.error(`Error fetching ${selectedReport} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeData = () => {
    return data.map(grade => {
      const student = students[grade.studentId] || {};
      const course = courses[grade.courseId] || {};
  
      return {
        studentId: student.studentId || "N/A",
        studentName: student.fullName || "N/A",
        courseCode: course.courseCode || "N/A",
        courseName: course.courseName || "N/A",
        quizScore: grade.quizScore ?? "Unassigned",
        midTermScore: grade.midTermScore ?? "Unassigned",
        finalExamScore: grade.finalExamScore ?? "Unassigned",
        totalScore: grade.totalScore ?? "Unassigned",
        finalGrade: grade.finalGrade || "N/A"
      };
    });
  };

  const fetchStudentsAndCourses = async (token) => {
    try {
      const [studentResponse, courseResponse] = await Promise.all([
        axios.get("http://localhost:8080/api/lecturers/users/students", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/api/lecturers/assigned-courses", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const studentMap = studentResponse.data.reduce((acc, student) => {
        acc[student.id] = {
          studentId: student.studentId,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
        };
        return acc;
      }, {});

      const courseMap = courseResponse.data.reduce((acc, course) => {
        acc[course.id] = {
          courseCode: course.courseCode,
          courseName: course.courseName,
        };
        return acc;
      }, {});

      setStudents(studentMap);
      setCourses(courseMap);
    } catch (error) {
      console.error("Error fetching students and courses:", error);
    }
  };

  const getEnrollmentData = () => {
    return data.map(enrollment => {
      const course = courses[enrollment.courseId] || {};
      const student = students[enrollment.studentId] || {}; 
    
      return {
        studentId: student.studentId || "N/A",  
        studentName: student.fullName || "N/A", 
        courseCode: course.courseCode || "N/A",
        courseName: course.courseName || "N/A",
        status: enrollment.status ? enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1).toLowerCase() : "Unknown",
        enrolledAt: enrollment.enrolledAt ? dayjs(enrollment.enrolledAt).format("YYYY-MM-DD HH:mm:ss") : "N/A",
        droppedAt: enrollment.droppedAt ? dayjs(enrollment.droppedAt).format("YYYY-MM-DD HH:mm:ss") : "Still Enrolled",
      };
    });
  };

  const generatePDF = () => {
    if (data.length === 0) {
      alert("No data available for PDF export.");
      return;
    }
  
    const isLandscape = selectedReport === "grades" || selectedReport === "enrollments" || selectedReport === "courses";
    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
    });
  
    let title = `${selectedReport.toUpperCase()} REPORT`;
    if ((selectedReport === "enrollments" || selectedReport === "grades") && 
        filterOption === "specific" && selectedCourse) {
      const course = courses[selectedCourse] || {};
      title += ` - ${course.courseCode || ''} ${course.courseName || ''}`;
    }

    doc.text(title, 14, 15);

    let headers = [];
    let rows = [];

    if (selectedReport === "students") {
      headers = [["Student ID", "First Name", "Last Name", "Email", "Phone Number", "Status"]];
      rows = data.map(student => [
        student.studentId,
        student.firstName,
        student.lastName,
        student.email,
        student.phoneNumber || "N/A",
        student.isActive ? "Active" : "Inactive",
      ]);
    } else if (selectedReport === "courses") {
      headers = [["Course Code", "Course Name", "Description", "Category", "Capacity", "Enrolled Students", "Status"]];
      rows = data.map(course => [
        course.courseCode,
        course.courseName,
        course.courseDescription || "N/A",
        course.category || "N/A",
        course.maxStudents || "N/A",
        course.enrolledStudents || 0,
        course.isFull ? "Full" : "Available"
      ]);
    } else if (selectedReport === "enrollments") {
      headers = [["Student ID", "Student Name", "Course Code", "Course Name", "Status", "Enrolled At", "Dropped At"]];
      rows = getEnrollmentData().map(item => [
        item.studentId,
        item.studentName,
        item.courseCode,
        item.courseName,
        item.status,
        item.enrolledAt,
        item.droppedAt,
      ]);
    } else if (selectedReport === "enrollments") {
      headers = [["Student ID", "Student Name", "Course Code", "Course Name", "Status", "Enrolled At", "Dropped At"]];
      rows = getEnrollmentData().map(item => [
        item.studentId,
        item.studentName,
        item.courseCode,
        item.courseName,
        item.status,
        item.enrolledAt,
        item.droppedAt,
      ]);
    } else if (selectedReport === "grades") {
      headers = [
        ["Student ID", "Student Name", "Course Code", "Course Name", 
         "Quiz Score", "Mid-Term Score", "Final Exam Score", 
         "Total Score", "Final Grade"]
      ];
      rows = getGradeData().map(item => [
        item.studentId,
        item.studentName,
        item.courseCode,
        item.courseName,
        item.quizScore,
        item.midTermScore,
        item.finalExamScore,
        item.totalScore,
        item.finalGrade,
      ]);
    }

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 20,
      styles: { cellWidth: "wrap" },
    });

    doc.save(`${selectedReport}-report.pdf`);
  };

  const generateExcel = () => {
    if (data.length === 0) {
      alert("No data available for Excel export.");
      return;
    }

    let formattedData = [];

    if (selectedReport === "students") {
      formattedData = data.map(student => ({
        "Student ID": student.studentId,
        "First Name": student.firstName,
        "Last Name": student.lastName,
        "Email": student.email,
        "Phone Number": student.phoneNumber || "N/A",
        "Status": student.isActive ? "Active" : "Inactive",
      }));
    } else if (selectedReport === "courses") {
      formattedData = data.map(course => ({
        "Course Code": course.courseCode,
        "Course Name": course.courseName,
        "Description": course.courseDescription || "N/A",
        "Category": course.category || "N/A",
        "Capacity": course.maxStudents || "N/A",
        "Enrolled Students": course.enrolledStudents || 0,
        "Status": course.isFull ? "Full" : "Available",
      }));
    } else if (selectedReport === "enrollments") {
      formattedData = getEnrollmentData().map(item => ({
        "Student ID": item.studentId,
        "Student Name": item.studentName,
        "Course Code": item.courseCode,
        "Course Name": item.courseName,
        "Status": item.status,
        "Enrolled At": item.enrolledAt,
        "Dropped At": item.droppedAt,
      }));
    }  else if (selectedReport === "grades") {
      formattedData = getGradeData().map(item => ({
        "Student ID": item.studentId,
        "Student Name": item.studentName,
        "Course Code": item.courseCode,
        "Course Name": item.courseName,
        "Quiz Score": item.quizScore,
        "Mid-Term Score": item.midTermScore,
        "Final Exam Score": item.finalExamScore,
        "Total Score": item.totalScore,
        "Final Grade": item.finalGrade,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();

    let sheetName = `${selectedReport}-report`;
  if ((selectedReport === "enrollments" || selectedReport === "grades") && 
      filterOption === "specific" && selectedCourse) {
    const course = courses[selectedCourse] || {};
    sheetName += `-${course.courseCode || ''}`;
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${sheetName}.xlsx`);
};

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
    setFilterOption("all");
    setSelectedCourse("");
  };

  return (
    <Card>
      <Card.Header>Reports Generation</Card.Header>
      <Card.Body>
        <p>Select a report type and download as PDF or Excel.</p>

        <Form.Group className="mb-3">
          <Form.Label>Report Type</Form.Label>
          <Form.Select value={selectedReport} onChange={handleReportChange}>
            <option value="students">Student Report</option>
            <option value="courses">Course Report</option>
            <option value="enrollments">Enrollment Report</option>
            <option value="grades">Grade Report</option>
          </Form.Select>
        </Form.Group>

        {(selectedReport === "enrollments" || selectedReport === "grades") && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filter By</Form.Label>
              <Form.Select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="all">All Courses</option>
                <option value="specific">Specific Course</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            {filterOption === "specific" && (
              <Form.Group>
                <Form.Label>Select Course</Form.Label>
                <Form.Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={filterOption !== "specific"}
                >
                  <option value="">Select a course</option>
                  {Object.keys(courses).map((courseId) => (
                    <option key={courseId} value={courseId}>
                      {courses[courseId].courseCode} - {courses[courseId].courseName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          </Col>
        </Row>
      )}

        <div className="d-flex gap-2 mt-3">
          <Button 
            variant="primary" 
            onClick={generatePDF}
            disabled={isLoading || ((selectedReport === "enrollments" || selectedReport === "grades") && filterOption === "specific" && !selectedCourse)}
          >
            {isLoading ? "Loading..." : "Download PDF Report"}
          </Button>
          <Button 
            variant="success" 
            onClick={generateExcel}
            disabled={isLoading || ((selectedReport === "enrollments" || selectedReport === "grades") && filterOption === "specific" && !selectedCourse)}
          >
            {isLoading ? "Loading..." : "Download Excel Report"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReportGenerationContent;
