import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Tabs, Tab, Card, Table, Badge, Button, Form, Alert, Accordion } from 'react-bootstrap';
import { FaSearch, FaRegTrashAlt, FaClock, FaUserGraduate} from 'react-icons/fa';
import { FaUsersLine } from "react-icons/fa6";
import CourseRegistrationModal from './CourseRegistrationModal'; 
import CourseDropModal from './CourseDropModal';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  // Format time with AM/PM
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

const getCreditsFromCode = (code) => {
  const match = code.match(/\d+/); 
  if (!match) return 3;
  const firstDigit = match[0][0];
  return parseInt(firstDigit) + 1;
};

const StudentEnrollmentManagement = () => {
  const [activeEnrollmentTab, setActiveEnrollmentTab] = useState('browse');
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('course'); 
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); 
  const [availableCourses, setAvailableCourses] = useState([]);
  const [alert, setAlert] = useState({ show: false, variant: 'success', message: '' });

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [droppedCourses, setDroppedCourses] = useState([]);
  const [dropError, setDropError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [availableRes, registeredRes, enrolledRes, droppedRes] = await Promise.all([
          axios.get('http://localhost:8080/api/students/available-courses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8080/api/students/courses/registered', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8080/api/students/courses/enrolled', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:8080/api/students/courses/dropped', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setAvailableCourses(availableRes.data);
        setRegisteredCourses(registeredRes.data);
        setEnrolledCourses(enrolledRes.data);
        setDroppedCourses(droppedRes.data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    
    fetchData();
  }, []);

  const getUnregisteredCourses = (courses) => {
    return courses.filter(course => 
      !registeredCourses.some(registered => registered.courseId === course.id)
    );
  };

  const filteredCourses = getUnregisteredCourses(
    availableCourses.filter(course => {
      const now = new Date();
      const enrollmentStart = new Date(course.enrollmentStart);
      const enrollmentEnd = new Date(course.enrollmentEnd);
      const isAvailable = now >= enrollmentStart && now <= enrollmentEnd;
    
      const matchesSearch = searchTerm === '' || (
        searchType === 'course'
          ? (
              course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : course.lecturers.some(lecturer =>
              `${lecturer.firstName} ${lecturer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && isAvailable) ||
        (availabilityFilter === 'unavailable' && !isAvailable);
    
      return matchesSearch && matchesAvailability;
    })
  );

  const handleRegister = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/students/courses/register/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAlert({
        show: true,
        variant: 'success',
        message: 'Successfully registered for the course!'
      });
      
      // Fetch all relevant data after registration
      const [availableRes, registeredRes, enrolledRes] = await Promise.all([
        axios.get('http://localhost:8080/api/students/available-courses', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/students/courses/registered', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/students/courses/enrolled', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAvailableCourses(availableRes.data);
      setRegisteredCourses(registeredRes.data);
      setEnrolledCourses(enrolledRes.data);
      setShowRegisterModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDropCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/students/courses/drop/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setAlert({
        show: true,
        variant: 'success',
        message: `Successfully dropped course`
      });
  
      // Fetch all relevant data after dropping
      const [enrolledRes, droppedRes, availableRes] = await Promise.all([
        axios.get('http://localhost:8080/api/students/courses/enrolled', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/students/courses/dropped', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8080/api/students/available-courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setEnrolledCourses(enrolledRes.data);
      setDroppedCourses(droppedRes.data);
      setAvailableCourses(availableRes.data);
      setShowDropModal(false);
      setDropError(null);
    } catch (error) {
      setDropError(error.response?.data || 'Failed to drop course');
    }
  };

  return (
    <Container fluid>
      {alert.show && (
        <Alert 
          variant={alert.variant} 
          onClose={() => setAlert({...alert, show: false})} 
          dismissible
          className="mt-3"
        >
          {alert.message}
        </Alert>
      )}
      <Tabs activeKey={activeEnrollmentTab} onSelect={setActiveEnrollmentTab} className="mb-4">
        <Tab eventKey="browse" title="Browse Courses">
          <Row className="mb-3">
            <Col md={12}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Form.Group className="d-flex align-items-center">
                  <Form.Select 
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="all">All Courses</option>
                    <option value="available">Available Now</option>
                    <option value="unavailable">Not Available</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex align-items-center flex-grow-1 ms-auto">
                  <FaSearch className="search-icon me-2" />
                  <Form.Select 
                    className="me-3"
                    style={{ width: '200px' }}
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="course">Search by Course</option>
                    <option value="lecturer">Search by Lecturer</option>
                  </Form.Select>
                  <Form.Control
                    type="text"
                    placeholder={`Search ${searchType === 'course' ? 'courses by code or name' : 'lecturers by name'}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <Col md={6} key={course.id} className="mb-4">
                  <CourseCard 
                    course={course}
                    onRegister={() => {
                      setSelectedCourse(course);
                      setShowRegisterModal(true);
                    }}
                  />
                </Col>
              ))
            ) : (
              <Col>
                <Alert variant="info">
                  No courses match your search criteria. Try adjusting your filters.
                </Alert>
              </Col>
            )}
          </Row>
        </Tab>

        <Tab eventKey="enrolled" title="My Enrollments">
        <h5 className="mb-3">Current Enrolled Courses</h5>
        {enrolledCourses.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course Code</th>
                <th style={{ width: '25%' }}>Course Name</th>
                <th style={{ width: '20%' }}>Lecturer</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '20%' }}>Enrolled At</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map(course => (
                <tr key={course.courseId}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>
                    {course.lecturers.map((l, index) => (
                      <div key={index}>Dr. {l.firstName} {l.lastName}</div>
                    ))}
                  </td>
                  <td>
                    <Badge bg={course.enrollmentStatus === 'ENROLLED' ? 'success' : 'warning'}>
                      {course.enrollmentStatus}
                    </Badge>
                  </td>
                  <td>{formatDateTime(course.enrolledAt)}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowDropModal(true);
                      }}
                    >
                    Drop
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="warning">
            You are not currently enrolled in any courses.
          </Alert>
        )}

      <h5 className="mb-3 mt-5">Previously Dropped Courses</h5>
      {droppedCourses.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Course Code</th>
              <th style={{ width: '25%' }}>Course Name</th>
              <th style={{ width: '20%' }}>Lecturer</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '20%' }}>Dropped At</th>
              <th style={{ width: '10%' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {droppedCourses.map(course => {
              const lecturer = course.lecturers[0]; // Get the first lecturer
              const lecturerEmail = lecturer?.email || '';
              const lecturerName = `${lecturer?.firstName || ''} ${lecturer?.lastName || ''}`;

              const studentFirstName = localStorage.getItem('firstName');
              const studentLastName = localStorage.getItem('lastName');
              const studentFullName = `${studentFirstName} ${studentLastName}`;

              const mailtoLink = `mailto:${lecturerEmail}?subject=Re-enrollment Request for ${course.courseCode} ${course.courseName}&body=Dear ${lecturerName},%0D%0A%0D%0AI would like to request re-enrollment for the course "${course.courseCode} ${course.courseName}" which I previously dropped.%0D%0A%0D%0ABest regards,%0D%0A${studentFullName}`;

              return (
                <tr key={course.courseId}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>
                    {course.lecturers.map((l, index) => (
                      <div key={index}>Dr. {l.firstName} {l.lastName}</div>
                    ))}
                  </td>
                  <td>
                    <Badge bg="danger">
                      {course.enrollmentStatus}
                    </Badge>
                  </td>
                  <td>{formatDateTime(course.droppedAt)}</td>
                  <td>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      onClick={() => window.location.href = mailtoLink}
                    >
                      Re-enroll
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">
          You have not dropped any courses yet.
        </Alert>
      )}
      </Tab>
      </Tabs>

      <CourseRegistrationModal
          show={showRegisterModal}
          onHide={() => setShowRegisterModal(false)}
          selectedCourse={selectedCourse}
          onConfirm={handleRegister}
        />

        <CourseDropModal
          show={showDropModal}
          onHide={() => {
            setShowDropModal(false);
            setDropError(null);
          }}
          selectedCourse={selectedCourse}
          error={dropError}
          onConfirm={handleDropCourse}
        />
    </Container>
  );
};

const CourseCard = ({ course, onRegister, isRegistered }) => {
  const [showDetails, setShowDetails] = useState(false);
  const now = new Date();
  const enrollmentStart = new Date(course.enrollmentStart);
  const enrollmentEnd = new Date(course.enrollmentEnd);
  const credits = getCreditsFromCode(course.courseCode || course.code || '');

  let enrollmentStatus = 'active';
  let buttonText = 'Register';
  let buttonVariant = 'outline-primary';
  
  if (now < enrollmentStart) {
    enrollmentStatus = 'upcoming';
    buttonText = 'Coming Soon';
    buttonVariant = 'outline-success';
  } else if (now > enrollmentEnd) {
    enrollmentStatus = 'ended';
    buttonText = 'Over Time';
    buttonVariant = 'outline-danger';
  }

  const canRegister = enrollmentStatus === 'active' && !isRegistered;

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <strong>{course.courseCode}</strong> - {course.courseName}
        </div>
        <Badge bg="info">{credits} Credits</Badge>
      </Card.Header>
      <Card.Body>
        <p className="d-flex align-items-center">
          <FaClock className="me-2" />
          <strong>Enrollment Period:</strong> 
          <span className="ms-1">
            {formatDate(enrollmentStart)} {formatTime(enrollmentStart)} to {formatDate(enrollmentEnd)} {formatTime(enrollmentEnd)}
          </span>
        </p>
        
        <p className="d-flex align-items-center">
          <FaUserGraduate className="me-2" /> 
          <strong>Lecturer(s):</strong> 
          <span className="ms-1">
            {course.lecturers.map(l => `Dr. ${l.firstName} ${l.lastName}`).join(', ')}
          </span>
        </p>
        
        <p className="d-flex align-items-center">
          <FaUsersLine className="me-2" /> 
          <strong>Capacity:</strong> 
          <span className="ms-1"> {course.maxStudents}</span>
        </p>

        <Accordion activeKey={showDetails ? 'details' : ''}>
          <Accordion.Item eventKey="details">
            <Accordion.Header onClick={() => setShowDetails(!showDetails)}>
              Course Details
            </Accordion.Header>
            <Accordion.Body>
              <p><strong>Category:</strong> {course.category}</p>
              <p><strong>Description: </strong>{course.courseDescription}</p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="d-flex justify-content-between mt-3">
          <Button 
            variant={buttonVariant}
            onClick={canRegister ? onRegister : undefined}
            disabled={!canRegister}
          >
            {buttonText}
            {enrollmentStatus === 'upcoming' && (
              <span className="ms-1">(Available {formatDate(enrollmentStart)} at {formatTime(enrollmentStart)})</span>
            )}
            {enrollmentStatus === 'ended' && (
              <span className="ms-1">(Closed {formatDate(enrollmentEnd)} at {formatTime(enrollmentEnd)})</span>
            )}
          </Button>
          <Button variant="outline-secondary" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StudentEnrollmentManagement;