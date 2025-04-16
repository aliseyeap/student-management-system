import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { Container, Row, Col, Tabs, Tab, Card, Table, Badge, ProgressBar, ListGroup } from 'react-bootstrap';

const getCreditsFromCode = (code) => {
  const match = code.match(/\d+/);
  if (!match) return 3;
  const firstDigit = match[0][0];
  return parseInt(firstDigit) + 1;
};

const getGradeColor = (grade) => {
  switch (grade) {
    case "A":
    case "A-":
      return "success";
    case "B+":
    case "B":
    case "B-":
      return "primary";
    case "C+":
    case "C":
      return "info";
    case "D":
      return "warning";
    case "F":
      return "dark";
    case "N/A":
      return "secondary";
    default:
      return "secondary";
  }
};

const StudentAcademicPerformance = () => {
  const [grades, setGrades] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  const getAcademicStanding = (cgpa) => {
    if (cgpa >= 3.7) {
      return {
        status: 'Dean\'s List',
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

  const academicStanding = getAcademicStanding(cgpa);

  useEffect(() => {
    const fetchData = async () => {
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
            quizScore: g.quizScore,
            midTermScore: g.midTermScore,
            finalExamScore: g.finalExamScore,
            totalScore: quiz + mid + final
          };
        });

        const totalCreds = merged.reduce((sum, c) => sum + c.credits, 0);
        const totalPoints = merged.reduce((sum, c) => sum + (c.credits * c.gradePoint), 0);
        const calculatedCgpa = totalCreds > 0 ? totalPoints / totalCreds : 0;

        setGrades(merged);
        setTotalCredits(totalCreds);
        setCgpa(calculatedCgpa);

      } catch (err) {
        console.error('Error fetching performance data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <h5>Cumulative GPA (CGPA)</h5>
              <h2>{cgpa.toFixed(2)}</h2>
              <ProgressBar 
                now={(cgpa/4.0)*100} 
                label={`${cgpa.toFixed(2)}/4.0`} 
                variant="success" 
                className="mt-2" 
              />
              <div className="mt-2">
                <small>Total Credits Earned: {totalCredits}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="stat-card h-100">
            <Card.Body>
              <h5>Academic Standing</h5>
              <h2>{academicStanding.status}</h2>
              <div className="mt-1">
                <small>{academicStanding.caption}</small>
              </div>
              <div className="mt-2">
                <Badge bg={academicStanding.badge} className="me-2">{academicStanding.status}</Badge>
                <Badge bg="info">Full-time Student</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="course" className="mb-4">
        <Tab eventKey="course" title="Course Performance">
          <h5 className="mb-3">All Courses Performance</h5>
          {grades.length === 0 ? (
            <p>No performance data available.</p>
          ) : (
            grades.map((course, index) => (
          <Card key={index} className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{course.courseCode} - {course.courseName}</strong> ({course.credits} credits)
              </div>
              <div>
                Final Grade: <Badge bg={getGradeColor(course.grade)}>{course.grade}</Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Exam Type</th>
                    <th style={{ width: '25%' }}>Weight</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Quiz</td>
                    <td>20%</td>
                    <td>{course.quizScore != null ? `${course.quizScore}%` : <Badge bg="danger">Haven't assigned</Badge>}</td>
                  </tr>
                  <tr>
                    <td>Mid Term Exam</td>
                    <td>30%</td>
                    <td>{course.midTermScore != null ? `${course.midTermScore}%` : <Badge bg="danger">Haven't assigned</Badge>}</td>
                  </tr>
                  <tr>
                    <td>Final Exam</td>
                    <td>50%</td>
                    <td>{course.finalExamScore != null ? `${course.finalExamScore}%` : <Badge bg="danger">Haven't assigned</Badge>}</td>
                  </tr>
                  <tr>
                    <td colSpan="2" className="text-end"><strong>Total Score :</strong></td>
                    <td><strong>{course.totalScore != null ? `${course.totalScore.toFixed(2)}%` : <Badge bg="danger">Haven't assigned</Badge>}</strong></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        ))
        )}
        </Tab>

        <Tab eventKey="summary" title="Academic Summary">
          <h5 className="mb-3">Academic Summary</h5>
          <Card className="mb-4">
            <Card.Body>
            {grades.length === 0 ? (
              <p>No performance data available.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Final Total Score</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((course, index) => (
                    <tr key={index}>
                      <td>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>{course.credits}</td>
                      <td>{course.totalScore != null ? `${course.totalScore.toFixed(2)}%` : 'N/A'}</td>
                      <td><Badge bg={getGradeColor(course.grade)}>{course.grade}</Badge></td>
                      <td>{course.gradePoint.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end"><strong>Overall CGPA:</strong></td>
                    <td><strong>{cgpa.toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end"><strong>Total Credits Earned:</strong></td>
                    <td><strong>{totalCredits}</strong></td>
                  </tr>
                </tfoot>
              </Table>
            )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default StudentAcademicPerformance;