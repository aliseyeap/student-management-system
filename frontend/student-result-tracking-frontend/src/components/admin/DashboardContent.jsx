import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Table, Badge, Form } from "react-bootstrap";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaGraduationCap, FaChalkboardTeacher, FaBook } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardContent = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalLecturers, setTotalLecturers] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState({});
  const filteredRecentUsers = recentUsers.filter(user => user.role !== 'ADMIN');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        setIsLoading(true);

        const [
          studentsResponse, 
          lecturersResponse, 
          coursesResponse,
          recentUsersResponse
        ] = await Promise.all([
          axios.get("http://localhost:8080/api/admin/users/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/admin/users/lecturers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/admin/courses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/admin/users/recent?count=7", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTotalStudents(studentsResponse.data.length);
        setTotalLecturers(lecturersResponse.data.length);
        setTotalCourses(coursesResponse.data.length);
        setRecentUsers(recentUsersResponse.data);
        
        const coursesData = coursesResponse.data;
        setCourses(coursesData);
        
        const detailsMap = {};
        coursesData.forEach(course => {
          detailsMap[course.id] = {
            name: course.courseName,
            code: course.courseCode
          };
        });
        setCourseDetails(detailsMap);

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
  
    const fetchGradeDistribution = async () => {
      try {
        const token = localStorage.getItem("token");
        setIsLoading(true);
  
        const response = await axios.get(
          `http://localhost:8080/api/admin/course/${selectedCourse}/student-grades`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const gradeCounts = {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          F: 0,
          NA: 0
        };
  
        let hasData = false;
  
        response.data.forEach(grade => {
          const finalGrade = grade.finalGrade || 'NA';
          gradeCounts[finalGrade]++;
          hasData = true;
        });
  
        setPerformanceData(
          hasData 
            ? Object.entries(gradeCounts).map(([grade, count]) => ({
                grade,
                count
              }))
            : [] 
        );
  
      } catch (error) {
        console.error("Error fetching grade distribution:", error);
        setPerformanceData([]); 
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchGradeDistribution();
  }, [selectedCourse]);

  const performanceChartData = {
    labels: performanceData.map(item => `Grade ${item.grade}`),
    datasets: [
      {
        data: performanceData.map(item => item.count),
        backgroundColor: [
          '#4CAF50', // A - Green
          '#8BC34A', // B - Light Green
          '#FFC107', // C - Yellow
          '#FF9800', // D - Orange
          '#F44336', // F - Red
          '#9E9E9E'  // NA - Gray
        ],
        hoverBackgroundColor: [
          '#388E3C',
          '#7CB342',
          '#FFA000',
          '#F57C00',
          '#D32F2F',
          '#757575'
        ]
      }
    ]
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'STUDENT':
        return <Badge bg="primary">Student</Badge>;
      case 'LECTURER':
        return <Badge bg="success">Lecturer</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
  };

  const getGradeBadge = (grade) => {
    switch(grade) {
      case 'A':
        return <Badge bg="success">A</Badge>;
      case 'B':
        return <Badge bg="primary">B</Badge>;
      case 'C':
        return <Badge bg="info">C</Badge>;
      case 'D':
        return <Badge bg="warning">D</Badge>;
      case 'F':
        return <Badge bg="danger">F</Badge>;
      default:
        return <Badge bg="secondary">NA</Badge>;
    }
  };

  return (
    <Container fluid>
      {/* Statistics Row */}
      <Row className="mb-4 d-flex align-items-stretch">
        <Col md={4}>
        <Card className="stat-card h-100">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="text-muted">Total Students</h5>
              <h2 className="mb-0">{totalStudents}</h2>
            </div>
            <FaGraduationCap size={40} className="text-primary" />
          </Card.Body>
        </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card h-100">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h5>Total Lecturers</h5>
              <h2>{totalLecturers}</h2>
            </div>
            <FaChalkboardTeacher size={40} className="text-primary" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card h-100">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Courses</h5>
                <h2>{totalCourses}</h2>
              </div>
              <FaBook size={40} className="text-primary" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Registrations */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>Recent User Registrations</Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredRecentUsers.length > 0 ? (
                    filteredRecentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No recent user registrations
                      </td>
                    </tr>
                  )}
                </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Statistics */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              Student Performance Statistics
              {selectedCourse && courseDetails[selectedCourse] && (
                <span className="ms-2">
                  for {courseDetails[selectedCourse].name} ({courseDetails[selectedCourse].code})
                </span>
              )}
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Course</Form.Label>
                <Form.Select 
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  disabled={isLoading || courses.length === 0}
                >
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {isLoading ? (
                <div className="text-center" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Loading grade data...
                </div>
              ) : (
                performanceData.length > 0 ? (
                  <>
                    <div style={{ height: '260px' }}>
                      <Pie 
                        data={performanceChartData}
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
                  </>
                ) : (
                  <div className="text-center" style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div>
                      <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                      <p className="mt-2">No grade data available for this course yet</p>
                      <small className="text-muted">Please check back later or contact the course instructor</small>
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

export default DashboardContent;