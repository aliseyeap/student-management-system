import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FaBook, FaChartLine, FaGraduationCap, FaCalendarAlt, FaFileAlt, FaCalculator } from 'react-icons/fa';
import CGPACalculatorModal from './CGPACalculatorModal';

const StudentDashboardContent = ({ setActiveTab }) => {
  // Academic Overview
  const [cgpa, setCgpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [academicStanding, setAcademicStanding] = useState({
    status: 'N/A',
    badge: 'secondary',
    caption: 'Not Available'
  });

  // Course Performance
  const [courseScores, setCourseScores] = useState([]);

  // Quick actions
  const [showCalculator, setShowCalculator] = useState(false);

  const handleQuickAction = (title) => {
    if (title === "View Course Performance") {
      setActiveTab("academics");
    } else if (title === "Register Course") {
      setActiveTab("enrollment");
    } else if (title === "CGPA Calculator") {
      setShowCalculator(true);
    }
  };

  const quickActions = [
    { 
      title: "View Course Performance", 
      icon: <FaFileAlt size={24} />, 
      variant: "primary",
      description: "View details course performance"
    },
    { 
      title: "Register Course", 
      icon: <FaCalendarAlt size={24} />, 
      variant: "success",
      description: "Enroll in all available courses"
    },
    { 
      title: "CGPA Calculator", 
      icon: <FaCalculator size={24} />, 
      variant: "info",
      description: "Calculate your CGPA"
    }
  ];

  useEffect(() => {
    const fetchCourseScores = async () => {
      try {
        const token = localStorage.getItem('token');
  
        const [gradeRes, courseRes] = await Promise.all([
          axios.get('http://localhost:8080/api/students/courses/performance', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get('http://localhost:8080/api/students/courses/registered', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);
  
        const courses = courseRes.data;
        const gradesData = gradeRes.data;
  
        const gradePointMap = {
          'A': 4.0,
          'A-': 3.7,
          'B+': 3.3,
          'B': 3.0,
          'B-': 2.7,
          'C+': 2.3,
          'C': 2.0,
          'D': 1.0,
          'F': 0.0
        };
  
        const getCreditsFromCode = (code) => {
          const match = code.match(/\d+/);
          if (!match) return 3;
          const firstDigit = match[0][0];
          return parseInt(firstDigit) + 1;
        };
  
        const merged = gradesData.map(g => {
          const courseInfo = courses.find(c => c.courseId === g.courseId);
          const courseCode = courseInfo?.courseCode || 'UNKNOWN';
          const courseName = courseInfo?.courseName || 'Unnamed Course';
          const credits = getCreditsFromCode(courseCode);
          const grade = g.finalGrade || 'N/A';
          const gradePoint = gradePointMap[grade] ?? 0.0;
  
          const quiz = g.quizScore ?? 0;
          const mid = g.midTermScore ?? 0;
          const final = g.finalExamScore ?? 0;
  
          return {
            courseCode,
            courseName,
            credits,
            grade,
            gradePoint,
            totalScore: quiz + mid + final
          };
        });
  
        // Set course scores for performance bar
        const coursePerformance = merged.map(m => ({
          courseCode: m.courseCode,
          courseName: m.courseName,
          totalScore: m.totalScore
        }));
  
        setCourseScores(coursePerformance);
  
        const totalCreds = merged.reduce((sum, c) => sum + c.credits, 0);
        const totalPoints = merged.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
        const calculatedCgpa = totalCreds > 0 ? totalPoints / totalCreds : 0;
  
        setCgpa(calculatedCgpa);
        setTotalCredits(totalCreds);
  
        // Academic Standing
        const getAcademicStanding = (cgpa) => {
          if (cgpa >= 3.7) {
            return {
              status: "Dean's List",
              badge: 'success',
              caption: 'Outstanding academic achievement'
            };
          } else if (cgpa >= 3.3) {
            return {
              status: 'Honors',
              badge: 'primary',
              caption: 'Excellent academic performance'
            };
          } else if (cgpa >= 2.7) {
            return {
              status: 'Good Standing',
              badge: 'info',
              caption: 'Meeting academic expectations'
            };
          } else if (cgpa >= 2.0) {
            return {
              status: 'Probation',
              badge: 'warning',
              caption: 'Academic performance below expectations'
            };
          } else {
            return {
              status: 'Academic Warning',
              badge: 'danger',
              caption: 'Immediate improvement required'
            };
          }
        };
  
        setAcademicStanding(getAcademicStanding(calculatedCgpa));
  
      } catch (err) {
        console.error("Failed to fetch course scores:", err);
      }
    };
  
    fetchCourseScores();
  }, []);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md={8}>
          {/* Academic Overview */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5>Academic Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="me-3" style={{ fontSize: '30px' }}>
                        <FaChartLine className="text-primary" />
                      </div>
                      <div>
                        <h5 className="mb-1">Cumulative GPA (CGPA)</h5>
                        <h4 className="mb-0">{cgpa.toFixed(2)}</h4>
                        <small>Total Credits Earned: {totalCredits}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6} className="mb-3">
                  <Card className="h-100 shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="me-3" style={{ fontSize: '30px' }}>
                        <FaGraduationCap className="text-success" />
                      </div>
                      <div>
                        <h5 className="mb-1">Academic Standing</h5>
                        <Badge bg={academicStanding.badge} className="mb-1" style={{ fontSize: '1rem' }}>
                          {academicStanding.status}
                        </Badge>
                        <div>
                          <small className="text-muted">{academicStanding.caption}</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Course Performance */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5>Course Performance</h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '275px', overflowY: 'auto' }}>
              {courseScores.length === 0 ? (
                <div className="text-center text-muted">
                  No course performance available
                </div>
              ) : (
                courseScores.map((course, index) => {
                  const getProgressBarVariant = (score) => {
                    if (score >= 80) return "success";
                    else if (score >= 60) return "info";
                    else if (score >= 40) return "warning";
                    else return "danger";
                  };

                  return (
                    <div className="mb-3" key={index}>
                      <div className="d-flex justify-content-between mb-1">
                        <span>{course.courseCode} - {course.courseName}</span>
                        <span>{course.totalScore.toFixed(2)}%</span>
                      </div>
                      <ProgressBar
                        now={course.totalScore}
                        variant={getProgressBarVariant(course.totalScore)}
                      />
                    </div>
                  );
                })
              )}
            </Card.Body>
          </Card>
        </Col>
  
        <Col md={4}>
          {/* Quick Actions */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5>Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              {quickActions.map((action, index) => (
                <Card className="mb-3" key={index}>
                  <Card.Body className="d-flex flex-column align-items-center text-center">
                    <Button 
                      variant={action.variant} 
                      className="mb-2 p-3 rounded-circle shadow-sm"
                      onClick={() => handleQuickAction(action.title)}
                    >
                      {action.icon}
                    </Button>
                    <h6>{action.title}</h6>
                    <small className="text-muted text-center">{action.description}</small>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
  
      <CGPACalculatorModal show={showCalculator} handleClose={() => setShowCalculator(false)} />
    </Container>
  );
};

export default StudentDashboardContent;
