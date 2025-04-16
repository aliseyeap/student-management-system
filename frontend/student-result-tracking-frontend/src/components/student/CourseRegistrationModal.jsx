import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Form, Alert } from 'react-bootstrap';

const getCreditsFromCode = (code) => {
  const match = code.match(/\d+/); 
  if (!match) return 3;
  const firstDigit = match[0][0];
  return parseInt(firstDigit) + 1;
};

const CourseRegistrationModal = ({ show, onHide, selectedCourse, onConfirm }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setConfirmed(false);
    setError(null);
  }, [selectedCourse, show]);

  const handleConfirm = async () => {
    if (!confirmed) {
      setError('Please confirm your intent to register by checking the box');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(selectedCourse.id);
    } catch (err) {
      setError(err.response?.data || err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Course Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mt-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {selectedCourse && (
          <>
            <h4>{selectedCourse.courseCode} - {selectedCourse.courseName}</h4>
            <p className="text-muted">{selectedCourse.courseDescription}</p>

            <Row className="mb-3">
              <Col md={6}>
                <p><strong>Credits:</strong> {getCreditsFromCode(selectedCourse.courseCode)}</p>
                <p><strong>Category:</strong> {selectedCourse.category || 'Not specified'}</p>
              </Col>
              <Col md={6}>
                <p><strong>Lecturer(s):</strong> {selectedCourse.lecturers.map(l => `Dr. ${l.firstName} ${l.lastName}`).join(', ')}</p>
                <p><strong>Capacity:</strong> {selectedCourse.maxStudents}</p>
                {selectedCourse.prerequisites?.length > 0 && (
                  <p>
                    <strong>Prerequisites:</strong> {selectedCourse.prerequisites.join(', ')}
                  </p>
                )}
              </Col>
            </Row>

            <Form>
              <Form.Check
                type="checkbox"
                label="I confirm that I would like to register for this course"
                checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                  if (e.target.checked) setShowWarning(false);
                }}
              />
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleConfirm}
          disabled={!confirmed || isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Confirm Registration'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CourseRegistrationModal;
