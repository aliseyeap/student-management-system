import { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert } from "react-bootstrap";

const GradeModal = ({ 
  show, 
  onHide, 
  grade, 
  student, 
  course, 
  scores, 
  setScores, 
  selectedScoreType, 
  setSelectedScoreType,
  actionType, 
  handleAssignScore, 
  handleUpdateScore 
}) => {
  if (!grade) return null;

  const [errorMessage, setErrorMessage] = useState(null);

  // Determine the score types to be shown based on action type and existing scores
  const scoreTypes = actionType === 'assign' 
    ? [
        { value: "quizScore", label: "Quiz Score (20%)", assigned: grade.quizScore !== null },
        { value: "midTermScore", label: "Mid-Term Score (30%)", assigned: grade.midTermScore !== null },
        { value: "finalExamScore", label: "Final Exam Score (50%)", assigned: grade.finalExamScore !== null }
      ].filter(score => score.assigned === false) // Show only unassigned scores for 'assign'
    : [
        { value: "quizScore", label: "Quiz Score (20%)", assigned: grade.quizScore !== null },
        { value: "midTermScore", label: "Mid-Term Score (30%)", assigned: grade.midTermScore !== null },
        { value: "finalExamScore", label: "Final Exam Score (50%)", assigned: grade.finalExamScore !== null }
      ].filter(score => score.assigned === true); // Show only assigned scores for 'update'

  const handleScoreChange = (e, max) => {
    let value = e.target.value;
    if (value === "") return setScores({ ...scores, [selectedScoreType]: "" });

    value = parseFloat(value);
    if (value < 0) value = 0;
    if (value > max) value = max;

    setScores({ ...scores, [selectedScoreType]: value });
  };

  const handleAction = async () => {
    try {
      if (actionType === 'assign') {
        await handleAssignScore();
      } else {
        await handleUpdateScore();
      }
      setErrorMessage(null); // Clear any previous errors on success
    } catch (error) {
      setErrorMessage(error.message || "An error occurred");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{actionType === 'assign' ? 'Assign Score' : 'Update Score'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        
        <Form>
          {/* Student Information */}
          <h5 className="mb-3">Student Info</h5>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Student ID</Form.Label>
                <Form.Control type="text" value={student?.studentId || "Loading..."} readOnly />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Student Name</Form.Label>
                <Form.Control type="text" value={student?.fullName || "Loading..."} readOnly />
              </Form.Group>
            </Col>
          </Row>

          {/* Course Information */}
          <h5 className="mb-3">Course</h5>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Course Code</Form.Label>
                <Form.Control type="text" value={course?.courseCode || "Loading..."} readOnly />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Course Name</Form.Label>
                <Form.Control type="text" value={course?.courseName || "Loading..."} readOnly />
              </Form.Group>
            </Col>
          </Row>

          {/* Score Type Selection */}
          <h5 className="mb-3">Choose Exam Type</h5>
          <Form.Group className="mb-3">
            <Form.Select 
              value={selectedScoreType} 
              onChange={(e) => setSelectedScoreType(e.target.value)}
            >
              <option value="">Select Score Type</option>
              {scoreTypes.map((score) => (
                <option key={score.value} value={score.value}>{score.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Score Input */}
          {selectedScoreType && (
            <Form.Group className="mb-3">
              <Form.Label>
                {selectedScoreType === "quizScore"
                  ? "Quiz Score (20%)"
                  : selectedScoreType === "midTermScore"
                  ? "Mid-Term Score (30%)"
                  : "Final Exam Score (50%)"}
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={selectedScoreType === "quizScore" ? "20" : selectedScoreType === "midTermScore" ? "30" : "50"}
                value={scores[selectedScoreType] || ""}
                onChange={(e) =>
                  handleScoreChange(e, selectedScoreType === "quizScore" ? 20 : selectedScoreType === "midTermScore" ? 30 : 50)
                }
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleAction} 
          disabled={!selectedScoreType}
        >
          {actionType === 'assign' ? 'Assign Score' : 'Update Score'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GradeModal;