import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import * as XLSX from "xlsx";
import axios from "axios";
import dayjs from "dayjs";

function ReportsContent() {
  const [selectedReport, setSelectedReport] = useState("students"); 
  const [data, setData] = useState([]); 
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState([]);
  const [filterOption, setFilterOption] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchData(); 
  }, [selectedReport, filterOption, selectedCourse]); 

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8080/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    let url = "";
    let fetchStudents = false;
    let fetchCourses = false;

    setIsLoading(true);
    
    try {
      switch (selectedReport) {
        case "students":
          url = "http://localhost:8080/api/admin/users/students";
          break;
        case "lecturers":
          url = "http://localhost:8080/api/admin/users/lecturers";
          break;
        case "courses":
          url = "http://localhost:8080/api/admin/courses";
          fetchCourses = true;
          break;
        case "assign-courses":
          url = "http://localhost:8080/api/admin/courses-assignment";
          fetchCourses = true;
          break;
        case "enrollments":
          fetchStudents = true;
          fetchCourses = true;
          if (filterOption === "specific" && selectedCourse) {
            url = `http://localhost:8080/api/admin/courses/${selectedCourse}/enrollments`;
          } else {
            url = "http://localhost:8080/api/admin/enrollments/all-enrollments";
          }
          break;
        case "grades":
          fetchStudents = true;
          fetchCourses = true;
          if (filterOption === "specific" && selectedCourse) {
            url = `http://localhost:8080/api/admin/course/${selectedCourse}/student-grades`;
          } else {
            url = "http://localhost:8080/api/admin/all-student-grades";
          }
          break;
        default:
          return;
      }
  
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
  
      if (fetchStudents) {
        const studentResponse = await axios.get("http://localhost:8080/api/admin/users/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const studentMap = studentResponse.data.reduce((acc, student) => {
          acc[student.id] = {
            studentId: student.studentId,
            fullName: `${student.firstName} ${student.lastName}`.trim(), 
          };
          return acc;
        }, {});
        setStudents(studentMap);
      }
  
      if (fetchCourses) {
        const courseResponse = await axios.get("http://localhost:8080/api/admin/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        const courseMap = courseResponse.data.reduce((acc, course) => {
          acc[course.id] = {
            courseCode: course.courseCode,
            courseName: course.courseName, 
          };
          return acc;
        }, {});
      
        setCourses(courseMap);
      }
    } catch (error) {
      console.error(`Error fetching ${selectedReport} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    if (data.length === 0) {
      alert("No data available for PDF export.");
      return;
    }

    const isLandscape = selectedReport === "grades" || 
                     selectedReport === "enrollments" || 
                     selectedReport === "courses" ||
                     selectedReport === "assign-courses";

    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
    });

    // Add filter info to title if filtered by course
    let title = `${selectedReport.toUpperCase()} REPORT`;
    if ((selectedReport === "grades" || selectedReport === "enrollments") && 
        filterOption === "specific" && selectedCourse) {
          const course = courses[selectedCourse] || {}; 
      title += ` - ${course?.courseCode || ''} ${course?.courseName || ''}`;
    }

    doc.text(title, 14, 15);
  
    let headers = [];
    let rows = [];
  
    if (selectedReport === "grades") {
      headers = [["Student ID", "Student Name", "Course Code", "Course Name", "Quiz Score", "Mid-Term Score", "Final Exam Score", "Total Score", "Final Grade"]];
    
      rows = data.map(grade => {
        const course = courses[grade.courseId] || {};
    
        return [
          students[grade.studentId]?.studentId || "N/A",
          students[grade.studentId]?.fullName || "N/A",
          course.courseCode || "N/A",
          course.courseName || "N/A",
          grade.quizScore ?? "Unassigned",
          grade.midTermScore ?? "Unassigned",
          grade.finalExamScore ?? "Unassigned",
          grade.totalScore ?? "Unassigned",
          grade.finalGrade ?? "NA",
        ];
      });
    } else if (selectedReport === "enrollments") {
      headers = [["Student ID", "Student Name", "Course Code", "Course Name", "Status", "Enrolled At", "Dropped At"]];
    
      rows = data.map(enrollment => {
        const course = courses[enrollment.courseId] || {}; 
    
        return [
          students[enrollment.studentId]?.studentId || "N/A",
          students[enrollment.studentId]?.fullName || "N/A",
          course.courseCode || "N/A",
          course.courseName || "N/A",
          enrollment.status === "ENROLLED" ? "Enrolled" : "Dropped",
          enrollment.enrolledAt ? dayjs(enrollment.enrolledAt).format("YYYY-MM-DD HH:mm:ss") : "N/A",
          enrollment.droppedAt ? dayjs(enrollment.droppedAt).format("YYYY-MM-DD HH:mm:ss") : "Still Enrolled",
        ];
      });
    } else if (selectedReport === "assign-courses") {
      headers = [["Course Code", "Course Name", "Status", "Assigned Lecturer", "Email", "Phone"]];
      rows = data.map(course => [
        course.courseCode,
        course.courseName,
        course.lecturerName && course.lecturerName !== "Not Assigned" ? "Assigned" : "Unassigned",
        course.lecturerName && course.lecturerName !== "Not Assigned" ? course.lecturerName.split(", ").join("\n")  : "N/A",
        (course.lecturerEmail || "N/A").replace(/, /g, "\n"),
        (course.lecturerPhoneNumbers || "N/A").replace(/, /g, "\n"),
      ]);
    } else if (selectedReport === "lecturers") {
      headers = [["Lecturer ID", "First Name", "Last Name", "Email", "Phone Number", "Status"]];
      rows = data.map(lecturer => [
        lecturer.employeeId,
        lecturer.firstName,
        lecturer.lastName,
        lecturer.email,
        lecturer.phoneNumber,
        lecturer.isActive ? "Active" : "Inactive",
      ]);
    } else if (selectedReport === "students") {
      headers = [["Student ID", "First Name", "Last Name", "Email", "Phone Number", "Status"]];
      rows = data.map(student => [
        student.studentId,
        student.firstName,
        student.lastName,
        student.email,
        student.phoneNumber,
        student.isActive ? "Active" : "Inactive",
      ]);
    } else if (selectedReport === "courses") {
      headers = [["Course Code", "Course Name", "Description", "Category", "Capacity", "Enroll Start", "Enroll End", "Drop Deadline"]];
      rows = data.map(course => [
        course.courseCode,
        course.courseName,
        course.courseDescription,
        course.category,
        course.maxStudents,
        course.enrollmentStart.split("T")[0],
        course.enrollmentEnd.split("T")[0],
        course.dropDeadline.split("T")[0],
      ]);
    
      // Add columnStyles for courses report
      const columnStyles = {
        0: { cellWidth: 30 },  // Course Code
        1: { cellWidth: 50 },  // Course Name
        2: { cellWidth: 70 },  // Description (wider)
        3: { cellWidth: 30 },  // Category
        4: { cellWidth: 20 },  // Capacity
        5: { cellWidth: 25 },  // Enroll Start
        6: { cellWidth: 25 },  // Enroll End
        7: { cellWidth: 25 }   // Drop Deadline
      };
    
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 20,
        styles: { cellWidth: "wrap" },
        columnStyles: columnStyles,  // Add custom column widths
        didDrawPage: function (data) {
          // Add page numbers
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
              `Page ${i} of ${pageCount}`,
              doc.internal.pageSize.width - 30,
              doc.internal.pageSize.height - 10
            );
          }
        }
      });
    }
  
    doc.save(`${selectedReport}-report.pdf`);
  };
  
  const generateExcel = () => {
    if (data.length === 0) {
      alert("No data available for Excel export.");
      return;
    }
  
    let formattedData = [];
  
    if (selectedReport === "grades") {
      formattedData = data.map(grade => {
        const course = courses[grade.courseId] || {};
    
        return {
          "Student ID": students[grade.studentId]?.studentId || "N/A",
          "Student Name": students[grade.studentId]?.fullName || "N/A",
          "Course Code": course.courseCode || "N/A",
          "Course Name": course.courseName || "N/A",
          "Quiz Score": grade.quizScore ?? "Unassigned",
          "Mid-Term Score": grade.midTermScore ?? "Unassigned",
          "Final Exam Score": grade.finalExamScore ?? "Unassigned",
          "Total Score": grade.totalScore ?? "Unassigned",
          "Final Grade": grade.finalGrade ?? "NA",
        };
      });
    } else if (selectedReport === "enrollments") {
      formattedData = data.map(enrollment => {
        const course = courses[enrollment.courseId] || {}; 
    
        return {
          "Student ID": students[enrollment.studentId]?.studentId || "N/A",
          "Student Name": students[enrollment.studentId]?.fullName || "N/A",
          "Course Code": course.courseCode || "N/A",
          "Course Name": course.courseName || "N/A",
          "Status": enrollment.status === "ENROLLED" ? "Enrolled" : "Dropped",
          "Enrolled At": enrollment.enrolledAt ? dayjs(enrollment.enrolledAt).format("YYYY-MM-DD HH:mm:ss") : "N/A",
          "Dropped At": enrollment.droppedAt ? dayjs(enrollment.droppedAt).format("YYYY-MM-DD HH:mm:ss") : "Still Enrolled",
        };
      });
    } else if (selectedReport === "assign-courses") {
      formattedData = data.map(course => ({
        "Course Code": course.courseCode,
        "Course Name": course.courseName,
        "Status": course.lecturerName && course.lecturerName !== "Not Assigned" ? "Assigned" : "Unassigned",
        "Assigned Lecturer": course.lecturerName && course.lecturerName !== "Not Assigned" ? course.lecturerName.split(", ").join("\n")  : "N/A",
        "Email": (course.lecturerEmail || "N/A").replace(/, /g, "\n"),
        "Phone": (course.lecturerPhoneNumbers || "N/A").replace(/, /g, "\n"),
      }));
    } else if (selectedReport === "lecturers") {
      formattedData = data.map(lecturer => ({
        "Lecturer ID": lecturer.employeeId,
        "First Name": lecturer.firstName,
        "Last Name": lecturer.lastName,
        "Email": lecturer.email,
        "Phone Number": lecturer.phoneNumber,
        "Status": lecturer.isActive ? "Active" : "Inactive",
      }));
    } else if (selectedReport === "students") {
      formattedData = data.map(student => ({
        "Student ID": student.studentId,
        "First Name": student.firstName,
        "Last Name": student.lastName,
        "Email": student.email,
        "Phone Number": student.phoneNumber,
        "Status": student.isActive ? "Active" : "Inactive",
      }));
    } else if (selectedReport === "courses") {
      formattedData = data.map(course => ({
        "Course Code": course.courseCode,
        "Course Name": course.courseName,
        "Description": course.courseDescription,
        "Category": course.category,
        "Capacity": course.maxStudents,
        "Enrollment Start": course.enrollmentStart.split("T")[0],
        "Enrollment End": course.enrollmentEnd.split("T")[0],
        "Drop Deadline": course.dropDeadline.split("T")[0],
      }));
    }
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    
    // Add filter info to sheet name if filtered by course
    let sheetName = `${selectedReport}-report`;
    if ((selectedReport === "grades" || selectedReport === "enrollments") && 
        filterOption === "specific" && selectedCourse) {
          const course = courses[selectedCourse] || {};
      sheetName += `-${course?.courseCode || ''}`;
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
          <Form.Select
            value={selectedReport}
            onChange={handleReportChange}
          >
            <option value="students">Student Report</option>
            <option value="lecturers">Lecturer Report</option>
            <option value="courses">Course Report</option>
            <option value="assign-courses">Assigned Courses Report</option>
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
                    {Array.isArray(courses) ? (
                      courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))
                    ) : (
                      Object.keys(courses).map((courseId) => (
                        <option key={courseId} value={courseId}>
                          {courses[courseId].courseCode} - {courses[courseId].courseName}
                        </option>
                      ))
                    )}
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
            disabled={isLoading || (filterOption === "specific" && !selectedCourse && (selectedReport === "enrollments" || selectedReport === "grades"))}
          >
            {isLoading ? 'Loading...' : 'Download PDF Report'}
          </Button>
          <Button 
            variant="success" 
            onClick={generateExcel}
            disabled={isLoading || (filterOption === "specific" && !selectedCourse && (selectedReport === "enrollments" || selectedReport === "grades"))}
          >
            {isLoading ? 'Loading...' : 'Download Excel Report'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReportsContent;