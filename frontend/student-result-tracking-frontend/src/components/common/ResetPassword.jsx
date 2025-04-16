import { useState } from 'react';
import { FaUniversity, FaLock, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { Form, Button, Container, Row, Col, Image, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
import backgroundImage from '../images/background3.png';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError('User not found. Please try with valid email again.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (Object.values(passwordCriteria).some(criteria => !criteria)) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.put("http://localhost:8080/api/auth/reset-password", {
        userId: userId,
        newPassword: newPassword
      });

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <header className="p-3 bg-dark text-white">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FaUniversity className="me-2" size={24} />
                <span className="fs-5 fw-bold">Student Management System</span>
              </div>
            </div>
          </Container>
        </header>

        <main className="d-flex flex-column min-vh-100">
          <Container className="flex-grow-1 d-flex align-items-center my-5">
            <Row className="g-5 w-100">
              <Col md={6} className="d-flex align-items-center">
                <Image 
                  src={backgroundImage} 
                  alt="University Campus" 
                  fluid
                  className="rounded shadow-lg"
                  style={{ maxHeight: '100vh', objectFit: 'cover' }}
                />
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <div className="w-100 text-center">
                  <div className="mb-3 text-success">
                    <FaCheck size={48} />
                  </div>
                  <h2>Password Reset Successful!</h2>
                  <p className="text-muted">
                    Your password has been updated. Redirecting to login...
                  </p>
                </div>
              </Col>
            </Row>
          </Container>
        </main>

        <footer className="bg-dark text-white py-3">
          <Container>
            <div className="text-center">
              &copy; {new Date().getFullYear()} Student Management System. All rights reserved.
            </div>
          </Container>
        </footer>
      </>
    );
  }

  return (
    <>
      <header className="p-3 bg-dark text-white">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUniversity className="me-2" size={24} />
              <span className="fs-5 fw-bold">Student Management System</span>
            </div>
          </div>
        </Container>
      </header>

      <main className="d-flex flex-column min-vh-100">
        <Container className="flex-grow-1 d-flex align-items-center my-5">
          <Row className="g-5 w-100">
            <Col md={6} className="d-flex align-items-center">
              <Image 
                src={backgroundImage} 
                alt="University Campus" 
                fluid
                className="rounded shadow-lg"
                style={{ maxHeight: '100vh', objectFit: 'cover' }}
              />
            </Col>

            <Col md={6} className="d-flex align-items-center">
              <div className="w-100">
                <h2 className="mb-4 text-center">Reset Password</h2>
                <p className="text-muted text-center mb-4">
                  Enter your new password below
                </p>
                
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
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
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100"
                      disabled={isLoading || Object.values(passwordCriteria).some(criteria => !criteria)}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="bg-dark text-white py-3">
        <Container>
          <div className="text-center">
            &copy; {new Date().getFullYear()} Student Management System. All rights reserved.
          </div>
        </Container>
      </footer>
    </>
  );
}

export default ResetPassword;