import { Modal, Form, Button } from "react-bootstrap";

function StudentModal({ show, handleClose, handleSubmit, studentData, setStudentData, editMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure only numeric input for phone number
    if (name === "phoneNumber" && !/^\d*$/.test(value)) {
      return;
    }

    setStudentData({ ...studentData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault(); 
    handleSubmit(e); // Call handleSubmit from StudentsContent
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Student" : "Add New Student"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleFormSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" name="firstName" value={studentData.firstName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" name="lastName" value={studentData.lastName} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" name="email" value={studentData.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={studentData.phoneNumber}
              onChange={handleChange}
              inputMode="numeric" // Helps mobile users
              pattern="[0-9]*" // Ensures only numbers are entered
              required
            />
          </Form.Group>
          {!editMode && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={studentData.password} onChange={handleChange} required />
            </Form.Group>
          )}
          {/* Centering the button */}
          <div className="text-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default StudentModal;
