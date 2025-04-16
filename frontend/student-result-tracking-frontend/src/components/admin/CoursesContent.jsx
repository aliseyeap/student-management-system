import { useState, useEffect } from "react";
import { Card, Table, Button, InputGroup, FormControl, Alert } from "react-bootstrap";
import axios from "axios";
import CourseModal from "./CourseModal";

function CoursesContent() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertVariant, setAlertVariant] = useState("success");

  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    courseDescription: "",
    category: "",
    maxStudents: "",
    enrollmentStart: "",
    enrollmentEnd: "",
    dropDeadline: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8080/api/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const showAlert = (message, variant = "success") => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditMode(true);
      setSelectedCourse(course);
      setFormData({
        courseCode: course.courseCode || "",
        courseName: course.courseName || "",
        courseDescription: course.courseDescription || "",
        category: course.category || "",
        maxStudents: course.maxStudents || "",
        enrollmentStart: course.enrollmentStart.split("T")[0],
        enrollmentEnd: course.enrollmentEnd.split("T")[0],
        dropDeadline: course.dropDeadline.split("T")[0],
      });
    } else {
      setEditMode(false);
      setSelectedCourse(null);
      setFormData({
        courseCode: "",
        courseName: "",
        courseDescription: "",
        category: "",
        maxStudents: "",
        enrollmentStart: "",
        enrollmentEnd: "",
        dropDeadline: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Error: No token found in localStorage.");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("Course deleted successfully!", "warning");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      showAlert("Failed to delete course.", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formattedData = {
      ...formData,
      maxStudents: parseInt(formData.maxStudents, 10),
      enrollmentStart: editMode 
          ? `${formData.enrollmentStart} 00:00:00` 
          : `${formData.enrollmentStart}T00:00:00`, 
      enrollmentEnd: editMode 
          ? `${formData.enrollmentEnd} 00:00:00`
          : `${formData.enrollmentEnd}T00:00:00`,
      dropDeadline: editMode 
          ? `${formData.dropDeadline} 00:00:00`
          : `${formData.dropDeadline}T00:00:00`,
    };

    try {
      if (editMode) {
        await axios.patch(`http://localhost:8080/api/admin/courses/${selectedCourse.id}/update`, formattedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert("Course successfully updated!", "success");
      } else {
        await axios.post("http://localhost:8080/api/admin/courses/create", formattedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showAlert("Course successfully created!", "success");
      }
      fetchCourses();
      handleCloseModal();
    } catch (error) {
      showAlert("Failed to save course.", "danger");
    }
  };

  const filteredCourses = courses.filter(course =>
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <InputGroup className="me-2" style={{ width: "800px" }}>
          <FormControl
            type="text"
            placeholder="Search by course code, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Button variant="primary" onClick={() => handleOpenModal()}>Add New Course</Button>
      </div>

      <Card>
        <Card.Header>List of Courses</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Capacity</th>
                <th>Enroll Start</th>
                <th>Enroll End</th>
                <th>Drop Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.courseDescription}</td>
                  <td>{course.category}</td>
                  <td>{course.maxStudents}</td>
                  <td>{course.enrollmentStart.split("T")[0]}</td>
                  <td>{course.enrollmentEnd.split("T")[0]}</td>
                  <td>{course.dropDeadline.split("T")[0]}</td>
                  <td>
                    <div className="d-flex flex-column">
                      <Button variant="outline-info" size="sm" className="mb-2" onClick={() => handleOpenModal(course)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(course.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center text-muted">No courses found.</td>
              </tr>
            )}
          </tbody>
          </Table>
        </Card.Body>
      </Card>

      <CourseModal
        show={showModal}
        handleClose={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        isEdit={editMode}
      />
    </>
  );
}

export default CoursesContent;
