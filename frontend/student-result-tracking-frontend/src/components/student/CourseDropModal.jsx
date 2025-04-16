import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CourseDropModal = ({ show, onHide, selectedCourse, error, onConfirm }) => {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Course Drop</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <>
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
  
              <h6 className="mb-3">Are you sure you want to drop {selectedCourse.courseCode} - {selectedCourse.courseName}?</h6>
  
              <div className="alert alert-info">
                <p className="mb-1"><strong>Note:</strong> If you need to re-enroll later, please contact:</p>
                <ul className="mb-0">
                  {selectedCourse.lecturers.map((lecturer, index) => (
                    <li key={index}>
                      Dr. {lecturer.firstName} {lecturer.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onConfirm(selectedCourse.courseId)}>
            Confirm Drop
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

export default CourseDropModal;
