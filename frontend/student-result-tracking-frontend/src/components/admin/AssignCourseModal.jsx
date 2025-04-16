import { Modal, Button, Form } from "react-bootstrap";

function AssignCourseModal({ show, handleClose, lecturers, selectedLecturerId, setSelectedLecturerId, handleAssignLecturer, selectedCourse }) {
  
  // Find the selected lecturer
  const selectedLecturer = lecturers.find(lecturer => lecturer.id === Number(selectedLecturerId));

  // Exclude lecturers already assigned to the selected course
  const availableLecturers = lecturers.filter(lecturer => 
    lecturer.isActive && 
    (!selectedCourse?.lecturerName || 
     !selectedCourse.lecturerName.includes(lecturer.firstName + " " + lecturer.lastName))
  );

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Assign to Lecturer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Control
          as="select"
          value={selectedLecturerId}
          onChange={(e) => setSelectedLecturerId(Number(e.target.value))} 
        >
          <option value="">-- Select Lecturer --</option>
          {availableLecturers.length > 0 ? (
            availableLecturers.map((lecturer) => (
              <option key={lecturer.id} value={lecturer.id}>  
                {lecturer.firstName} {lecturer.lastName}
              </option>
            ))
          ) : (
            <option disabled>No lecturers available</option>
          )}
        </Form.Control>

        {/* Show selected lecturer details */}
        {selectedLecturer && (
          <div className="mt-3">
            <h6>Selected Lecturer:</h6>
            <p><strong>Employee ID:</strong> {selectedLecturer.employeeId}</p> 
            <p><strong>Name:</strong> {selectedLecturer.firstName} {selectedLecturer.lastName}</p>
            <p><strong>Email:</strong> {selectedLecturer.email}</p>
            <p><strong>Phone:</strong> {selectedLecturer.phoneNumber || "N/A"}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAssignLecturer} disabled={!selectedLecturerId}>
          Assign
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignCourseModal;
