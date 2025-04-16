import { Card, Form, Button, Alert, Row, Col, Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  PersonFill, 
  EnvelopeFill, 
  TelephoneFill 
} from "react-bootstrap-icons";

const ProfileManagement = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;

        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber || "",
        });
      } catch (err) {
        setError("Failed to fetch profile data. Please try again.");
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await axios.put("http://localhost:8080/api/auth/update-profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("firstName", formData.firstName);
      localStorage.setItem("lastName", formData.lastName);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError("Profile update failed. Please try again.");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <h2 className="mb-4 text-center">Profile Management</h2>
        <Card className="shadow">
          <Card.Body>
            {showSuccess && <Alert variant="success" className="text-center">Profile updated successfully!</Alert>}
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <PersonFill />
                      </span>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <PersonFill />
                      </span>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <EnvelopeFill />
                  </span>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    disabled 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <TelephoneFill />
                  </span>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button variant="primary" type="submit">
                  Update Profile
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ProfileManagement;