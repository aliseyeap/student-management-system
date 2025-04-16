import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Table, Alert } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';

const CGPACalculatorModal = ({ show, handleClose }) => {
  const [courses, setCourses] = useState([{ id: 1, name: '', credits: '', grade: 'A' }]);
  const [cgpa, setCgpa] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [errors, setErrors] = useState({});

  const gradePoints = {
    'A': 4.0,
    'B': 3.0,
    'C': 2.0,
    'D': 1.0,
    'F': 0.0
  };

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setCourses([{ id: 1, name: '', credits: '', grade: 'A' }]);
    setCgpa(null);
    setShowResult(false);
    setErrors({});
  };

  const handleAddCourse = () => {
    setCourses([...courses, { 
      id: courses.length + 1, 
      name: '', 
      credits: '', 
      grade: 'A' 
    }]);
  };

  const handleRemoveCourse = (id) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setCourses(courses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    let isValid = true;

    courses.forEach(course => {
      if (!course.name.trim()) {
        newErrors[course.id] = newErrors[course.id] || {};
        newErrors[course.id].name = 'Course name is required';
        isValid = false;
      }
      if (!course.credits || isNaN(course.credits)) {
        newErrors[course.id] = newErrors[course.id] || {};
        newErrors[course.id].credits = 'Valid credit hours are required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const calculateCGPA = () => {
    if (!validateInputs()) return;

    let totalCredits = 0;
    let totalGradePoints = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const gradePoint = gradePoints[course.grade] || 0;
      
      totalCredits += credits;
      totalGradePoints += credits * gradePoint;
    });

    if (totalCredits > 0) {
      const calculatedCGPA = totalGradePoints / totalCredits;
      setCgpa(calculatedCGPA.toFixed(2));
      setShowResult(true);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>CGPA Calculator</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ position: 'relative' }}>
      {showResult && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(4px)',
          padding: '30px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          width: '90%',
          maxWidth: '600px'
        }}>
          <div style={{ position: 'relative', zIndex: 1060 }}>
            <Button 
              variant="link" 
              onClick={() => setShowResult(false)}
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                padding: 0,
                lineHeight: 1,
                fontSize: '1.25rem',
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: '#000',
                zIndex: 1061
              }}
            >
              <X size={30} />
            </Button>
          </div>

          <Alert variant="info" className="mb-0">
            <Alert.Heading>Your Calculated CGPA</Alert.Heading>
            <p className="mb-2">
              Based on {courses.length} course(s), your CGPA is: 
              <strong className="display-4 ms-2">{cgpa}</strong>
            </p>
            <hr />
            <p className="mb-0 small">
              Note: This is an estimate. Official CGPA may vary based on institutional policies.
            </p>
          </Alert>
        </div>
      )}
      
      <div 
        className="table-scroll-wrapper" 
        style={{ 
          maxHeight: '500px', 
          overflowY: 'auto',
          filter: showResult ? 'blur(2px)' : 'none',
          transition: 'filter 0.2s ease'
        }}
      >
      <Table striped bordered hover>
        <thead>
          <tr>
            <th style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>Course Name</th>
            <th style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>Credit Hours</th>
            <th style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>Grade</th>
            <th style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>
                <Form.Control
                  type="text"
                  placeholder="Course name"
                  value={course.name}
                  onChange={(e) => handleChange(course.id, 'name', e.target.value)}
                  isInvalid={!!errors[course.id]?.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[course.id]?.name}
                </Form.Control.Feedback>
              </td>
              <td>
                <Form.Control
                  type="number"
                  placeholder="Credits"
                  value={course.credits}
                  onChange={(e) => handleChange(course.id, 'credits', e.target.value)}
                  min="1"
                  isInvalid={!!errors[course.id]?.credits}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[course.id]?.credits}
                </Form.Control.Feedback>
              </td>
              <td>
                <Form.Select
                  value={course.grade}
                  onChange={(e) => handleChange(course.id, 'grade', e.target.value)}
                >
                  {Object.keys(gradePoints).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleRemoveCourse(course.id)}
                  disabled={courses.length <= 1}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>

    <div className="d-flex justify-content-between mt-3">
      <Button variant="secondary" onClick={handleAddCourse}>
        Add Another Course
      </Button>
      <Button variant="primary" onClick={calculateCGPA}>
        Calculate CGPA
      </Button>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Close
    </Button>
  </Modal.Footer>
  </Modal>
);
};

export default CGPACalculatorModal;