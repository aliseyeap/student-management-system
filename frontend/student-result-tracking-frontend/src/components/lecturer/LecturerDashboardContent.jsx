import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Form } from "react-bootstrap";
import { FaBook, FaUsers, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const LecturerDashboardContent = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [students, setStudents] = useState({});
  const [courses, setCourses] = useState({});
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState({ A: 0, B: 0, C: 0, D: 0, F: 0, NA: 0 });
  const [isGradeLoading, setIsGradeLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    const fetchTotalStudents = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/lecturers/users/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalStudents(response.data.length);
      } catch (error) {
        console.error("Error fetching total students:", error);
      }
    };

    const fetchAssignedCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/lecturers/assigned-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignedCourses(response.data);
        setTotalCourses(response.data.length);
        
        // Set the first course as selected by default if available
        if (response.data.length > 0) {
          setSelectedCourse(response.data[0].id);
          fetchGradeDistributionByCourse(response.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching assigned courses:", error);
      }
    };

    const fetchEnrollments = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/lecturers/all-course-enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrollments = response.data.sort((a, b) =>
          dayjs(b.enrolledAt).diff(dayjs(a.enrolledAt))
        );

        setTotalEnrollments(enrollments.length);
        setRecentEnrollments(enrollments.slice(0, 7));

        fetchStudentDetails(enrollments.map(e => e.studentId));
        fetchCourseDetails(enrollments.map(e => e.courseId));
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };

    const fetchStudentDetails = async (studentIds) => {
      try {
        const uniqueIds = [...new Set(studentIds)];
        const studentResponses = await Promise.all(
          uniqueIds.map(id =>
            axios.get(`http://localhost:8080/api/lecturers/students/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const studentMap = {};
        studentResponses.forEach(res => {
          studentMap[res.data.id] = res.data.studentName;
        });

        setStudents(studentMap);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };

    const fetchCourseDetails = async (courseIds) => {
      try {
        const uniqueIds = [...new Set(courseIds)];
        const courseResponses = await Promise.all(
          uniqueIds.map(id =>
            axios.get(`http://localhost:8080/api/lecturers/courses/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const courseMap = {};
        courseResponses.forEach(res => {
          courseMap[res.data.id] = {
            code: res.data.courseCode,
            name: res.data.courseName
          };
        });

        setCourses(courseMap);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchTotalStudents();
    fetchAssignedCourses();
    fetchEnrollments();
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchGradeDistributionByCourse(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchGradeDistributionByCourse = async (courseId) => {
    setIsGradeLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/lecturers/course/${courseId}/student-grades`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0, NA: 0 };
      response.data.forEach(grade => {
        const g = grade.finalGrade || "NA";
        if (gradeCounts[g] !== undefined) {
          gradeCounts[g]++;
        }
      });
  
      setGradeDistribution(gradeCounts);
    } catch (error) {
      console.error("Error fetching grade distribution for course:", error);
    } finally {
      setIsGradeLoading(false);
    }
  };

  const gradeLabels = ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade F', 'NA'];
  const gradeValues = [
    gradeDistribution.A,
    gradeDistribution.B,
    gradeDistribution.C,
    gradeDistribution.D,
    gradeDistribution.F,
    gradeDistribution.NA,
  ];

  const realGradeData = {
    labels: gradeLabels,
    datasets: [
      {
        data: gradeValues,
        backgroundColor: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336', '#9E9E9E'],
        hoverBackgroundColor: ['#388E3C', '#7CB342', '#FFA000', '#F57C00', '#D32F2F', '#757575']
      }
    ]
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Students</h5>
                <h2>{totalStudents}</h2>
              </div>
              <FaUsers size={40} className="text-primary" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Courses</h5>
                <h2>{totalCourses}</h2>
              </div>
              <FaBook size={40} className="text-primary" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Enrollments</h5>
                <h2>{totalEnrollments}</h2>
              </div>
              <FaClipboardList size={40} className="text-primary" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Recent Enrollments</Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrolled On</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.length > 0 ? (
                    recentEnrollments.map(enrollment => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.studentName || "Loading..."}</td>
                        <td>
                          {courses[enrollment.courseId]
                            ? `${courses[enrollment.courseId].code} - ${courses[enrollment.courseId].name}`
                            : "Loading..."}
                        </td>
                        <td>{dayjs(enrollment.enrolledAt).format("YYYY-MM-DD HH:mm")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No recent enrollments</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              Student Performance Statistics
              {selectedCourse && courses[selectedCourse] && (
                <span className="ms-2">
                  for {courses[selectedCourse].name} ({courses[selectedCourse].code})
                </span>
              )}
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Course</Form.Label>
                <Form.Select 
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  disabled={assignedCourses.length === 0}
                >
                  {assignedCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {isGradeLoading ? (
                <div className="text-center" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Loading grade data...
                </div>
              ) : (
                assignedCourses.length > 0 ? (
                  gradeValues.some(value => value > 0) ? (
                    <div style={{ height: '260px' }}>
                      <Pie 
                        data={realGradeData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? 
                                    ((context.raw / total) * 100).toFixed(1) : 0;
                                  return `${context.label}: ${context.raw} students (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div>
                        <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                        <p className="mt-2">No grade data available for this course yet</p>
                        <small className="text-muted">Please assign marks and check back later</small>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>
                      <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                      <p className="mt-2">No courses assigned</p>
                    </div>
                  </div>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LecturerDashboardContent;