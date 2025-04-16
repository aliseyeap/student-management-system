package com.example.student_result_tracking_backend.controller;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.mapper.CourseEnrollmentMapper;
import com.example.student_result_tracking_backend.service.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserService userService;
    private final CourseService courseService;
    private final AssignLecturerService assignLecturerService;
    private final CourseEnrollmentService courseEnrollmentService;
    private final CourseEnrollmentMapper courseEnrollmentMapper;
    private final GradeService gradeService;
    private final StudentService studentService;
    private final LecturerService lecturerService;

    @Autowired
    public AdminController(UserService userService, CourseService courseService,
                           AssignLecturerService assignLecturerService,
                           CourseEnrollmentService courseEnrollmentService,
                           CourseEnrollmentMapper courseEnrollmentMapper,
                           GradeService gradeService, StudentService studentService,
                           LecturerService lecturerService) {
        this.userService = userService;
        this.courseService = courseService;
        this.assignLecturerService = assignLecturerService;
        this.courseEnrollmentService = courseEnrollmentService;
        this.courseEnrollmentMapper = courseEnrollmentMapper;
        this.gradeService = gradeService;
        this.studentService = studentService;
        this.lecturerService = lecturerService;
    }

    // ---------------------- USER MANAGEMENT ----------------------
    // Register lecturer
    @PostMapping("/users/register/lecturer")
    public ResponseEntity<LecturerDTO> registerLecturer(@Valid @RequestBody LecturerDTO lecturerDTO) {
        return ResponseEntity.ok(userService.createLecturer(lecturerDTO));
    }

    // Register student
    @PostMapping("/users/register/student")
    public ResponseEntity<StudentDTO> registerStudent(@Valid @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(userService.createStudent(studentDTO));
    }

    // Delete lecturer and student
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User with ID " + userId + " deleted successfully.");
    }

    // Update lecturer and students details (except password)
    @PatchMapping("/users/{userId}/update")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(userService.updateUser(userId, updates));
    }

    // Active and deactivate account for lecturer and students
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<String> setUserStatus(@PathVariable Long userId, @RequestParam boolean isActive) {
        userService.setUserStatus(userId, isActive);
        return ResponseEntity.ok("User ID " + userId + " has been " + (isActive ? "activated" : "deactivated") + ".");
    }

    // View all students
    @GetMapping("/users/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(userService.getAllStudents());
    }

    // View all lecturers
    @GetMapping("/users/lecturers")
    public ResponseEntity<List<LecturerDTO>> getAllLecturers() {
        return ResponseEntity.ok(userService.getAllLecturers());
    }

    // View specific user
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.of(userService.getUserById(userId));
    }

    // View specific students
    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        Optional<StudentDTO> studentDTO = studentService.getStudentById(id);
        return studentDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // View specific lecturer
    @GetMapping("/lecturers/{id}")
    public ResponseEntity<LecturerDTO> getLecturerById(@PathVariable Long id) {
        Optional<LecturerDTO> lecturerDTO = lecturerService.getLecturerById(id);
        return lecturerDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Fetch all users with roles "Student" and "Lecturer"
    @GetMapping("/users")
    public ResponseEntity<List<UserListDTO>> getAllUsers() {
        List<UserListDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // ---------------------- COURSE MANAGEMENT ----------------------
    // View all course
    @GetMapping("/courses")
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // View courses based on categories
    @GetMapping("/courses/category/{category}")
    public ResponseEntity<List<CourseDTO>> getCoursesByCategory(@PathVariable String category) {
        String decodedCategory = URLDecoder.decode(category, StandardCharsets.UTF_8);
        return ResponseEntity.ok(courseService.getCoursesByCategory(decodedCategory));
    }

    // View specific course
    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.of(courseService.getCourseById(id));
    }

    //Create course
    @PostMapping("/courses/create")
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.saveCourse(courseDTO));
    }

    // Update course
    @PatchMapping("/courses/{id}/update")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(courseService.updateCourse(id, updates));
    }

    // Delete course
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course successfully deleted");
    }

    // ---------------------- COURSE ASSIGNMENT ----------------------
    // Assign course to lecturer
    @PostMapping("/courses/{courseId}/assign-lecturer/{lecturerId}")
    public ResponseEntity<AssignLecturerDTO> assignLecturer(@PathVariable Long courseId, @PathVariable Long lecturerId) {
        return ResponseEntity.ok(assignLecturerService.assignLecturer(courseId, lecturerId));
    }

    // View all courses assignment
    @GetMapping("/courses-assignment")
    public ResponseEntity<List<CourseWithLecturerDTO>> getAllCoursesWithLecturer() {
        List<CourseWithLecturerDTO> courses = courseService.getAllCoursesWithLecturer();
        return ResponseEntity.ok(courses);
    }

    // View all courses assigned to a lecturer
    @GetMapping("/courses/assigned")
    public ResponseEntity<List<CourseWithLecturerDTO>> getAssignedCourses() {
        return ResponseEntity.ok(courseService.getAssignedCourses());
    }

    // View all courses NOT assigned to any lecturer
    @GetMapping("/courses/unassigned")
    public ResponseEntity<List<CourseWithLecturerDTO>> getUnassignedCourses() {
        return ResponseEntity.ok(courseService.getUnassignedCourses());
    }

    // ---------------------- OTHERS FUNCTION THAT MAY HAVE ----------------------
    // View all the course enrollments details
    @GetMapping("/enrollments/all-enrollments")
    public ResponseEntity<List<CourseEnrollmentDTO>> getAllEnrollments() {
        List<CourseEnrollmentDTO> enrollments = courseEnrollmentService.getAllEnrollments()
                .stream()
                .map(courseEnrollmentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(enrollments);
    }

    // View enrollments for a specific course
    @GetMapping("/courses/{courseId}/enrollments")
    public ResponseEntity<List<CourseEnrollmentDTO>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        List<CourseEnrollmentDTO> enrollments = courseEnrollmentService.getEnrollmentsByCourse(courseId)
                .stream()
                .map(courseEnrollmentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(enrollments);
    }

    // View all student grades
    @GetMapping("/all-student-grades")
    public ResponseEntity<List<GradeDTO>> getAllStudentGrades() {
        List<GradeDTO> grades = gradeService.getAllStudentGrades();
        return ResponseEntity.ok(grades);
    }

    // View all student grades for a specific course
    @GetMapping("/course/{courseId}/student-grades")
    public ResponseEntity<List<GradeDTO>> getStudentGradesByCourse(@PathVariable Long courseId) {
        List<GradeDTO> grades = gradeService.getStudentGradesByCourse(courseId);
        return ResponseEntity.ok(grades);
    }

    // View all recent users
    @GetMapping("/users/recent")
    public ResponseEntity<List<RecentUserDTO>> getRecentUsers(
            @RequestParam(defaultValue = "5") int count) {
        List<RecentUserDTO> recentUsers = userService.getRecentUsers(count);
        return ResponseEntity.ok(recentUsers);
    }

}
