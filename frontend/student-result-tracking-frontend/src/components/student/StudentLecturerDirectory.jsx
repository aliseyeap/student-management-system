import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button} from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

const StudentLecturerDirectory = () => {
  const [lecturerCourses, setLecturerCourses] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLecturerCourses = async () => {
      try {
        const token = localStorage.getItem('token'); 
    
        const response = await axios.get('http://localhost:8080/api/students/lecturer-course', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        const lecturerMap = {};
    
        response.data.forEach(course => {
          if (course.lecturerEmail === "N/A" || course.lecturerName === "Not Assigned") return;
    
          const names = course.lecturerName.split(',').map(name => name.trim());
          const emails = course.lecturerEmail.split(',').map(email => email.trim());
          const phones = course.lecturerPhoneNumbers.split(',').map(phone => phone.trim());
    
          names.forEach((name, i) => {
            const email = emails[i] || "N/A";
            const phone = phones[i] || "N/A";
    
            if (!lecturerMap[email]) {
              lecturerMap[email] = {
                lecturerEmail: email,
                lecturerName: `Dr. ${name}`,
                lecturerPhoneNumbers: phone,
                courses: [],
                image: '/images/default-lecturer.jpg'
              };
            }
    
            lecturerMap[email].courses.push(`${course.courseCode} - ${course.courseName}`);
          });
        });
    
        const groupedLecturers = Object.values(lecturerMap);
        setLecturerCourses(groupedLecturers);
        setSelectedLecturer(groupedLecturers[0]);
      } catch (error) {
        console.error('Failed to fetch lecturer course data', error);
      }
    };

    fetchLecturerCourses();
  }, []);

  const filteredLecturers = lecturerCourses.filter(lecturer =>
    lecturer.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredLecturers.length === 0) {
      setSelectedLecturer(null);
    } else if (!filteredLecturers.some(l => l.lecturerEmail === selectedLecturer?.lecturerEmail)) {
      setSelectedLecturer(filteredLecturers[0]);
    }
  }, [searchTerm, lecturerCourses]);

  return (
    <Container fluid>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search lecturers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card.Header>
            <Card.Body className="lecturer-list">
            {filteredLecturers.length === 0 ? (
              <div className="text-center text-muted">No available lecturer</div>
            ) : (
              <ListGroup variant="flush">
                {filteredLecturers.map((lecturer, index) => (
                  <ListGroup.Item
                    key={index}
                    active={selectedLecturer?.lecturerEmail === lecturer.lecturerEmail}
                    onClick={() => setSelectedLecturer(lecturer)}
                    action
                  >
                    <h6>{lecturer.lecturerName}</h6>
                    <small className="text-muted">{lecturer.lecturerEmail}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
        <Card>
          <Card.Header>
            {selectedLecturer ? (
              <div className="d-flex align-items-center">
                <div>
                  <h4>{selectedLecturer.lecturerName}</h4>
                  <h6 className="text-muted">{selectedLecturer.lecturerEmail}</h6>
                </div>
              </div>
            ) : (
              <h5 className="text-muted">No available lecturer information</h5>
            )}
          </Card.Header>

          <Card.Body>
            {selectedLecturer ? (
              <>
                <Row>
                  <Col md={6}>
                    <h5>Contact Information</h5>
                    <p><strong>Email:</strong> {selectedLecturer.lecturerEmail}</p>
                    <p><strong>Phone:</strong> {selectedLecturer.lecturerPhoneNumbers}</p>
                    <p><strong>Office Hours:</strong> Mon - Fri, 8am - 5pm</p>
                  </Col>
                  <Col md={6}>
                    <h5>Courses Teaching</h5>
                    <ul>
                      {selectedLecturer.courses.map((course, index) => (
                        <li key={index}>{course}</li>
                      ))}
                    </ul>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button 
                    variant="outline-primary"
                    onClick={() =>
                      window.location.href = `mailto:${selectedLecturer.lecturerEmail}?subject=Student Inquiry&body=Dear ${selectedLecturer.lecturerName},%0D%0A%0D%0A`
                    }
                  >
                    Contact Lecturer
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted text-center">
                Lecturer was not existed.
              </div>
            )}
          </Card.Body>
        </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentLecturerDirectory;
