import { Modal, Form, Button } from "react-bootstrap";

function LecturerModal({ show, handleClose, handleSubmit, lecturerData, setLecturerData, editMode }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ensure only numeric input for phone number
    if (name === "phoneNumber" && !/^\d*$/.test(value)) {
      return;
    }

    setLecturerData({ ...lecturerData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e); // Call handleSubmit from LecturersContent
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Lecturer" : "Add New Lecturer"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleFormSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={lecturerData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={lecturerData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={lecturerData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={lecturerData.phoneNumber}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]*"
              required
            />
          </Form.Group>
          {!editMode && (
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={lecturerData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}
          {/* Centering the button */}
          <div className="text-end">
            <Button variant="secondary" onClick={handleClose} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editMode ? "Update Lecturer" : "Add Lecturer"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default LecturerModal;
