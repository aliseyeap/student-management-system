import { Modal, Button, Form } from "react-bootstrap";

const EnrollStudentModal = ({ show, onClose, course, students, selectedStudentId, setSelectedStudentId, handleEnrollStudent }) => {
  
  const selectedStudent = students.find(student => student.id === Number(selectedStudentId));

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Enroll Student</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {course ? (
          <>
            <h5>Course: {course.courseName}</h5>

            <Form.Control
              as="select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            >
              <option value="">-- Select a Student --</option>
              {students.length > 0 ? (
                students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))
              ) : (
                <option disabled>No students available</option>
              )}
            </Form.Control>

            {selectedStudent && (
              <div className="mt-3">
                <h6>Selected Student:</h6>
                <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phoneNumber || "N/A"}</p>
              </div>
            )}
          </>
        ) : (
          <p>No course selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleEnrollStudent} disabled={!selectedStudentId}>
          Enroll
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EnrollStudentModal;
