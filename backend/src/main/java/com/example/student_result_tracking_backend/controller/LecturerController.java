package com.example.student_result_tracking_backend.controller;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Lecturer;
import com.example.student_result_tracking_backend.exception.AccessDeniedException;
import com.example.student_result_tracking_backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lecturers")
@PreAuthorize("hasRole('LECTURER')")
public class LecturerController {
    private final CourseService courseService;
    private final CourseEnrollmentService enrollmentService;
    private final StudentService studentService;
    private final LecturerService lecturerService;
    private final GradeService gradeService;
    private final UserService userService;

    @Autowired
    public LecturerController(CourseService courseService, CourseEnrollmentService enrollmentService,
                              StudentService studentService, LecturerService lecturerService,
                              GradeService gradeService, UserService userService) {
        this.courseService = courseService;
        this.enrollmentService = enrollmentService;
        this.studentService = studentService;
        this.lecturerService = lecturerService;
        this.gradeService = gradeService;
        this.userService = userService;
    }

    // ---------------------- COURSE ASSIGNED ----------------------
    // View all assigned courses
    @GetMapping("/assigned-courses")
    public ResponseEntity<List<AssignedCourseDTO>> getLecturerCourses(Principal principal) {
        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        List<Course> courses = courseService.getCoursesByLecturerId(lecturer.getId());

        List<AssignedCourseDTO> assignedCourses = courses.stream()
                .map(course -> new AssignedCourseDTO(
                        course.getId(),
                        course.getCourseCode(),
                        course.getCourseName(),
                        course.getCourseDescription(),
                        course.getCategory(),
                        course.getMaxStudents(),
                        enrollmentService.getEnrolledStudentCount(course),
                        course.getCreatedAt(),
                        course.getUpdatedAt(),
                        course.getEnrollmentStart(),
                        course.getEnrollmentEnd(),
                        course.getDropDeadline(),
                        course.isFull(enrollmentService)
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(assignedCourses);
    }

    // View specific course by ID
    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // ---------------------- COURSE ENROLLMENT ----------------------
    // Enroll a new student to course
    @PostMapping("/enroll-new-student")
    public ResponseEntity<String> enrollNewStudent(
            @RequestParam Long studentId, @RequestParam Long courseId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        if (!courseService.isLecturerAssignedToCourse(lecturer.getId(), courseId)) {
            throw new AccessDeniedException("You do not have permission to enroll students in this course.");
        }

        enrollmentService.enrollStudentInCourse(studentId, courseId);
        return ResponseEntity.ok("Student successfully enrolled.");
    }

    // Removes student from course
    @PostMapping("/drop-student")
    public ResponseEntity<String> lecturerDropStudent(
            @RequestParam Long studentId, @RequestParam Long courseId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        if (!courseService.isLecturerAssignedToCourse(lecturer.getId(), courseId)) {
            throw new AccessDeniedException("You do not have permission to drop students from this course.");
        }

        enrollmentService.dropStudentFromCourse(studentId, courseId);
        return ResponseEntity.ok("Student successfully dropped.");
    }

    // Re-enroll a dropped student
    @PatchMapping("/re-enroll-student")
    public ResponseEntity<String> reEnrollDroppedStudent(
            @RequestParam Long studentId, @RequestParam Long courseId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        if (!courseService.isLecturerAssignedToCourse(lecturer.getId(), courseId)) {
            throw new AccessDeniedException("You do not have permission to re-enroll students in this course.");
        }

        enrollmentService.reEnrollStudent(studentId, courseId);
        return ResponseEntity.ok("Student successfully re-enrolled.");
    }

    // View all student enrollments for lecturer's courses
    @GetMapping("/all-course-enrollments")
    public ResponseEntity<List<CourseEnrollmentDTO>> getAllStudentsByLecturerCourses(Principal principal) {
        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        List<CourseEnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByLecturer(lecturer.getId());
        return ResponseEntity.ok(enrollments);
    }

    // View enrolled students for a specific course
    @GetMapping("/course-enrollments")
    public ResponseEntity<List<CourseEnrollmentDTO>> getEnrollmentsByLecturerCourse(
            @RequestParam Long courseId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        if (!courseService.isLecturerAssignedToCourse(lecturer.getId(), courseId)) {
            throw new AccessDeniedException("You do not have permission to view this course's enrollments.");
        }

        List<CourseEnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByLecturerCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }

    // ---------------------- GRADE MANAGEMENT ----------------------
    // Enters scores for each exam
    @PostMapping("/assign-grade")
    public ResponseEntity<GradeDTO> assignGrade(
            @RequestParam Long studentId, @RequestParam Long courseId,
            @RequestParam String examType, @RequestParam Double score, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        GradeDTO newGrade = gradeService.assignGrade(lecturer.getId(), studentId, courseId, examType, score);
        return ResponseEntity.ok(newGrade);
    }

    // Update scores for each exam
    @PutMapping("/update-grade")
    public ResponseEntity<GradeDTO> updateGrade(
            @RequestParam Long studentId, @RequestParam Long courseId,
            @RequestParam String examType, @RequestParam Double score, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        GradeDTO updatedGrade = gradeService.updateGrade(lecturer.getId(), studentId, courseId, examType, score);
        return ResponseEntity.ok(updatedGrade);
    }

    // View all students grades
    @GetMapping("/all-student-grades")
    public ResponseEntity<List<GradeDTO>> getAllStudentGrades(Principal principal) {
        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        List<GradeDTO> grades = gradeService.getAllStudentGradesForLecturer(lecturer.getId());
        return ResponseEntity.ok(grades);
    }

    // View students' grades based on course
    @GetMapping("/course/{courseId}/student-grades")
    public ResponseEntity<List<GradeDTO>> getStudentGradesByCourse(
            @PathVariable Long courseId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        List<GradeDTO> grades = gradeService.getStudentGradesByCourse(lecturer.getId(), courseId);
        return ResponseEntity.ok(grades);
    }

    // View specific student's grade
    @GetMapping("/course/{courseId}/student/{studentId}/grades")
    public ResponseEntity<GradeDTO> getStudentPerformance(
            @PathVariable Long courseId, @PathVariable Long studentId, Principal principal) {

        Lecturer lecturer = lecturerService.getLecturerByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        GradeDTO grade = gradeService.getStudentPerformance(lecturer.getId(), studentId, courseId);
        return ResponseEntity.ok(grade);
    }

    // View all students
    @GetMapping("/users/students")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(userService.getAllStudents());
    }

    // View specific student by ID
    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
