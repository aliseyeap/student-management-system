package com.example.student_result_tracking_backend.controller;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.entity.Student;
import com.example.student_result_tracking_backend.repository.StudentRepository;
import com.example.student_result_tracking_backend.service.CourseService;
import com.example.student_result_tracking_backend.service.GradeService;
import com.example.student_result_tracking_backend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private GradeService gradeService;

    // View available course for register
    @GetMapping("/available-courses")
    public ResponseEntity<List<AvailableCourseDTO>> getAvailableCourses() {
        return ResponseEntity.ok(courseService.getAvailableCourses());
    }

    // View all registered courses
    @GetMapping("/courses/registered")
    public ResponseEntity<List<StudentCourseDTO>> getStudentCourses(Principal principal) {
        Student loggedInStudent = studentService.getLoggedInStudent(principal);

        // Fetch and return registered courses
        return ResponseEntity.ok(studentService.getStudentCourses(loggedInStudent.getId()));
    }

    // View all enrolled courses
    @GetMapping("/courses/enrolled")
    public ResponseEntity<List<StudentCourseDTO>> getEnrolledCourses(Principal principal) {
        Student loggedInStudent = studentService.getLoggedInStudent(principal);

        return ResponseEntity.ok(studentService.getEnrolledCourses(loggedInStudent.getId()));
    }

    // View all dropped courses
    @GetMapping("/courses/dropped")
    public ResponseEntity<List<StudentCourseDTO>> getDroppedCourses(Principal principal) {
        Student loggedInStudent = studentService.getLoggedInStudent(principal);

        return ResponseEntity.ok(studentService.getDroppedCourses(loggedInStudent.getId()));
    }

    // Register course
    @PostMapping("/courses/register/{courseId}")
    public ResponseEntity<String> registerForCourse(@PathVariable Long courseId, Principal principal) {
        Student loggedInStudent = studentService.getLoggedInStudent(principal);
        studentService.registerForCourse(loggedInStudent.getId(), courseId);
        return ResponseEntity.ok("Successfully registered for the course.");
    }

    // Drop course
    @PutMapping("/courses/drop/{courseId}")
    public ResponseEntity<String> dropCourse(@PathVariable Long courseId, Principal principal) {
        Student loggedInStudent = studentService.getLoggedInStudent(principal);
        studentService.dropCourse(loggedInStudent.getId(), courseId);
        return ResponseEntity.ok("Successfully dropped the course.");
    }

    // View all course performance
    @GetMapping("/courses/performance")
    public ResponseEntity<List<GradeDTO>> getMyGrades(Principal principal) {
        Student student = studentService.getStudentByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<GradeDTO> grades = gradeService.getStudentGrades(student.getId());
        return ResponseEntity.ok(grades);
    }

    // View specific course performance
    @GetMapping("/courses/performance/{courseId}")
    public ResponseEntity<GradeDTO> getMyGradeForCourse(@PathVariable Long courseId, Principal principal) {
        Student student = studentService.getStudentByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Grade grade = gradeService.getStudentGradeForCourse(student.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Grade not found"));

        GradeDTO gradeDTO = GradeDTO.fromEntity(grade);
        return ResponseEntity.ok(gradeDTO);
    }

    // View all courses assignment
    @GetMapping("/lecturer-course")
    public ResponseEntity<List<CourseWithLecturerDTO>> getAllCoursesWithLecturer() {
        List<CourseWithLecturerDTO> courses = courseService.getAllCoursesWithLecturer();
        return ResponseEntity.ok(courses);
    }
}
