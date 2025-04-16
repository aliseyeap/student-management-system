import { useState } from 'react';
import { FaUniversity, FaEnvelope } from 'react-icons/fa';
import { Form, Button, Container, Row, Col, Image, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../images/background2.png';
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:8080/api/auth/check-email", { email });

      // Store user email and ID in localStorage
      localStorage.setItem("email", response.data.email);
      localStorage.setItem("userId", response.data.userId);

      setSuccess("User found. Redirecting to password reset...");
      
      setTimeout(() => {
        navigate("/reset-password");
      }, 2000);

    } catch (err) {
      setError("Email not found. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Image Column */}
            <Col md={6} className="d-flex align-items-center">
              <Image 
                src={backgroundImage} 
                alt="University Campus" 
                fluid
                className="rounded shadow-lg"
                style={{ maxHeight: '100vh', objectFit: 'cover' }}
              />
            </Col>

            {/* Form Column */}
            <Col md={6} className="d-flex align-items-center">
              <div className="w-100">                
                <h2 className="mb-4 text-center">Forgot Password</h2>
                <p className="text-muted text-center mb-4">
                  Enter your registered email for verification
                </p>
                
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {success && <Alert variant="success" className="mb-3">{success}</Alert>}
                
                <Form onSubmit={handleNext}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                    {isLoading ? "Checking..." : "Next"}
                  </Button>

                  <div className="text-center">
                    <a 
                      href="#" 
                      className="text-decoration-none d-inline-flex align-items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/');
                      }}
                    >
                      Back to Login
                    </a>
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

export default ForgotPassword;