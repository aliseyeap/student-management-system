package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.CourseEnrollmentDTO;
import com.example.student_result_tracking_backend.dto.StudentResponseDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.entity.Student;
import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import com.example.student_result_tracking_backend.repository.CourseEnrollmentRepository;
import com.example.student_result_tracking_backend.repository.CourseRepository;
import com.example.student_result_tracking_backend.repository.GradeRepository;
import com.example.student_result_tracking_backend.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CourseEnrollmentService {
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final GradeRepository gradeRepository;

    public CourseEnrollmentService(CourseEnrollmentRepository courseEnrollmentRepository, CourseRepository courseRepository, StudentRepository studentRepository, GradeRepository gradeRepository) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.gradeRepository = gradeRepository;
    }

    // --------------------- ENROLLMENT MANAGEMENT ---------------------
    // Enroll a student in course
    @Transactional
    public void enrollStudentInCourse(Long studentId, Long courseId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if the student is already enrolled
        if (courseEnrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new IllegalStateException("Student is already enrolled in this course.");
        }

        // Check if the course is full
        if (course.isFull(this)) {
            throw new IllegalStateException("Course is full. Enrollment is not allowed.");
        }

        // Enroll the student
        CourseEnrollment enrollment = new CourseEnrollment(student, course, EnrollmentStatus.ENROLLED);
        courseEnrollmentRepository.save(enrollment);

        // Automatically create a Grade sheet
        Grade grade = new Grade();
        grade.setStudent(enrollment.getStudent());
        grade.setCourse(enrollment.getCourse());
        gradeRepository.save(grade);
    }

    // Drop students
    @Transactional
    public void dropStudentFromCourse(Long studentId, Long courseId) {
        CourseEnrollment enrollment = courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new IllegalStateException("Enrollment not found."));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollment.getStatus() == EnrollmentStatus.DROPPED) {
            throw new IllegalStateException("Student has already dropped this course.");
        }

        enrollment.dropCourse(); // Updates status and timestamp
        courseEnrollmentRepository.save(enrollment);
    }

    // Re-enroll students
    @Transactional
    public void reEnrollStudent(Long studentId, Long courseId) {
        CourseEnrollment enrollment = courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new IllegalStateException("Enrollment not found."));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check the status of enrollment
        if (enrollment.getStatus() != EnrollmentStatus.DROPPED) {
            throw new IllegalStateException("Student is not in DROPPED status.");
        }

        // Check if the course is full
        if (course.isFull(this)) {
            throw new IllegalStateException("Course is full. Re-enrollment is not allowed.");
        }

        enrollment.reEnroll();
        enrollment.setEnrolledAt(LocalDateTime.now());
        courseEnrollmentRepository.save(enrollment);
    }

    // Get enrollments by lecturer
    public List<CourseEnrollmentDTO> getEnrollmentsByLecturer(Long lecturerId) {
        List<Course> courses = courseRepository.findByLecturers_Id(lecturerId);
        return courseEnrollmentRepository.findByCourseIn(courses).stream()
                .map(enrollment -> new CourseEnrollmentDTO(
                        enrollment.getId(),
                        enrollment.getStudent().getId(),
                        enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName(),
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getCourseName(),
                        enrollment.getStatus(),
                        enrollment.getEnrolledAt(),
                        enrollment.getDroppedAt()
                ))
                .collect(Collectors.toList());
    }

    // Get students by course
    public List<StudentResponseDTO> getStudentsByCourse(Long courseId) {
        return courseEnrollmentRepository.findByCourseId(courseId).stream()
                .map(enrollment -> new StudentResponseDTO(
                        enrollment.getStudent().getId(),
                        enrollment.getStudent().getEmail(),
                        enrollment.getStudent().getFirstName(),
                        enrollment.getStudent().getLastName(),
                        enrollment.getStudent().getPhoneNumber(),
                        enrollment.getStudent().getStudentId(),
                        enrollment.getStudent().getIsActive()
                ))
                .collect(Collectors.toList());
    }

    // Get enrollment by courses
    public List<CourseEnrollmentDTO> getEnrollmentsByLecturerCourse(Long courseId) {
        return courseEnrollmentRepository.findByCourseId(courseId).stream()
                .map(enrollment -> new CourseEnrollmentDTO(
                        enrollment.getId(),
                        enrollment.getStudent().getId(),
                        enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName(),
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getCourseName(),
                        enrollment.getStatus(),
                        enrollment.getEnrolledAt(),
                        enrollment.getDroppedAt()
                ))
                .collect(Collectors.toList());
    }

    // --------------------- QUERY METHODS ---------------------
    // Get enrollments for multiple courses
    public List<CourseEnrollment> getEnrollmentsByCourses(List<Course> courses) {
        return courseEnrollmentRepository.findByCourseIn(courses);
    }

    // Get all enrollments
    public List<CourseEnrollment> getAllEnrollments() {
        return courseEnrollmentRepository.findAll();
    }

    // Get enrollments for a single course
    public List<CourseEnrollment> getEnrollmentsByCourse(Long courseId) {
        return courseEnrollmentRepository.findByCourseId(courseId);
    }

    // Get a single enrollment by ID
    public Optional<CourseEnrollment> getEnrollmentById(Long id) {
        return courseEnrollmentRepository.findById(id);
    }

    // Get enrollment by student and course
    public Optional<CourseEnrollment> getEnrollment(Long studentId, Long courseId) {
        return courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    // Get students enrolled in a specific course
    public List<Student> getStudentsByCourse(Course course) {
        return courseEnrollmentRepository.findByCourse(course)
                .stream()
                .map(CourseEnrollment::getStudent)
                .collect(Collectors.toList());
    }

    // Find Student and Course
    public Optional<CourseEnrollment> findByStudentAndCourse(Student student, Course course) {
        return courseEnrollmentRepository.findByStudentAndCourse(student, course);
    }

    // Get a student's enrolled courses
    public List<CourseEnrollment> getEnrolledCoursesByStudent(Student student) {
        return courseEnrollmentRepository.findByStudentAndDroppedAtIsNotNull(student);
    }

    // Get a student's dropped courses
    public List<CourseEnrollment> getDroppedCoursesByStudent(Student student) {
        return courseEnrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.DROPPED);
    }

    // --------------------- HELPER METHODS ---------------------
    // Check whether a student is currently enrolled in a course
    public boolean isStudentEnrolled(Long studentId, Long courseId) {
        return courseEnrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }

    // Get the number of actively enrolled students in a course
    public int getEnrolledStudentCount(Course course) {
        return courseEnrollmentRepository.countByCourseAndStatus(course, EnrollmentStatus.ENROLLED);
    }

    // Check whether student is dropped
    public EnrollmentStatus getEnrollmentStatus(Long studentId, Long courseId) {
        Optional<CourseEnrollment> enrollment = courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);

        return enrollment.get().getStatus();
    }

}
