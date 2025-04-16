import { FaUniversity } from 'react-icons/fa';
import { Button, Container, Image, Form, Row, Col } from 'react-bootstrap';
import backgroundImage from '../images/background.png';
import '../css/Login.css';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });

      const { token, role, id, firstName, lastName } = response.data;

      // Store user details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "LECTURER") navigate("/lecturer/dashboard");
      else if (role === "STUDENT") navigate("/student/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data || "Login failed. Please try again.");
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

            {/* Login Form Column */}
            <Col md={6} className="d-flex align-items-center">
              <div className="w-100">
                <h2 className="mb-4 text-center">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="Enter email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between mb-4">
                    <Form.Check type="checkbox" label="Remember me" />
                    <a href="/forgot-password" className="text-decoration-none">
                      Forgot password?
                    </a>
                  </div>

                  <Button variant="primary" type="submit" className="w-100 mb-3">
                    Login
                  </Button>
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
};

export default Login;