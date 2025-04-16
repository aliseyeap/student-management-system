import { Card, Form, Button, Alert, Modal, Row, Col, Container } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  LockFill,
  KeyFill,
  CheckCircleFill,
  XCircleFill
} from "react-bootstrap-icons";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!formData.newPassword) newErrors.newPassword = "New password is required";
    if (Object.values(passwordCriteria).includes(false)) {
      newErrors.newPassword = "Password does not meet all requirements.";
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.put(
        "http://localhost:8080/api/auth/change-password",
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setShowModal(true);
    } catch (err) {
      setErrorMessage("Password change failed. Please check your current password and try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 text-center">Change Password</h2>
        <Card className="shadow">
          <Card.Body>
            {showSuccess && <Alert variant="success" className="text-center">Password changed successfully!</Alert>}
            {errorMessage && <Alert variant="danger" className="text-center">{errorMessage}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <LockFill />
                  </span>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.currentPassword}
                    required
                  />
                </div>
                <Form.Control.Feedback type="invalid">{errors.currentPassword}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <KeyFill />
                  </span>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                    required
                  />
                </div>
                <Form.Control.Feedback type="invalid">{errors.newPassword}</Form.Control.Feedback>
                <div className="mt-2">
                  <small className="text-muted">Password requirements:</small>
                  <ul className="list-unstyled mt-2">
                    <li className={passwordCriteria.length ? "text-success" : "text-danger"}>
                      {passwordCriteria.length ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
                      At least 8 characters
                    </li>
                    <li className={passwordCriteria.uppercase ? "text-success" : "text-danger"}>
                      {passwordCriteria.uppercase ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
                      At least one uppercase letter
                    </li>
                    <li className={passwordCriteria.lowercase ? "text-success" : "text-danger"}>
                      {passwordCriteria.lowercase ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
                      At least one lowercase letter
                    </li>
                    <li className={passwordCriteria.digit ? "text-success" : "text-danger"}>
                      {passwordCriteria.digit ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
                      At least one digit (0-9)
                    </li>
                    <li className={passwordCriteria.specialChar ? "text-success" : "text-danger"}>
                      {passwordCriteria.specialChar ? <CheckCircleFill className="me-2" /> : <XCircleFill className="me-2" />}
                      At least one special character
                    </li>
                  </ul>
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <KeyFill />
                  </span>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    required
                  />
                </div>
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button variant="primary" type="submit">
                  Change Password
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Modal to ask user to log in again */}
        <Modal show={showModal} onHide={handleLogout} centered>
          <Modal.Header closeButton>
            <Modal.Title>Password Changed</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Your password has been changed successfully. Please log in again with your new password.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleLogout}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default ChangePassword;