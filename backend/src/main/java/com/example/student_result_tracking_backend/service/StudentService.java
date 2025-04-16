package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.LecturerInfoDTO;
import com.example.student_result_tracking_backend.dto.StudentCourseDTO;
import com.example.student_result_tracking_backend.dto.StudentDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.entity.Student;
import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import com.example.student_result_tracking_backend.mapper.StudentMapper;
import com.example.student_result_tracking_backend.repository.CourseEnrollmentRepository;
import com.example.student_result_tracking_backend.repository.CourseRepository;
import com.example.student_result_tracking_backend.repository.GradeRepository;
import com.example.student_result_tracking_backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final GradeRepository gradeRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, StudentMapper studentMapper, CourseRepository courseRepository,
                          CourseEnrollmentRepository courseEnrollmentRepository, GradeRepository gradeRepository) {
        this.studentRepository = studentRepository;
        this.studentMapper = studentMapper;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.gradeRepository = gradeRepository;
    }

    // Get all students
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(studentMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get student by Student ID
    public Optional<StudentDTO> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId).map(studentMapper::toDTO);
    }

    // Save or update student
    public StudentDTO saveStudent(StudentDTO studentDTO) {
        Student student = studentMapper.toEntity(studentDTO);
        Student savedStudent = studentRepository.save(student);
        return studentMapper.toDTO(savedStudent);
    }

    // Delete student by ID
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new IllegalArgumentException("Student with ID " + id + " not found");
        }
        studentRepository.deleteById(id);
    }

    // Get Student entity by ID (used internally)
    public Optional<Student> findStudentEntityById(Long id) {
        return studentRepository.findById(id);
    }

    // Convert Student entity to DTO and return
    public Optional<StudentDTO> getStudentById(Long id) {
        return findStudentEntityById(id).map(studentMapper::toDTO);
    }

    public Optional<Student> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    // Get student entity
    public Student getLoggedInStudent(Principal principal) {
        return studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Logged-in student not found"));
    }

    // Register course
    public void registerForCourse(Long studentId, Long courseId) {
        // Fetch student and course
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if course has at least one lecturer assigned
        if (course.getLecturers() == null || course.getLecturers().isEmpty()) {
            throw new RuntimeException("This course is not available for enrollment.");
        }

        // Check if the course is within the enrollment period
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(course.getEnrollmentStart()) || now.isAfter(course.getEnrollmentEnd())) {
            throw new RuntimeException("Enrollment period for this course is closed.");
        }

        // Check if student is already registered
        boolean alreadyEnrolled = courseEnrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
        if (alreadyEnrolled) {
            throw new RuntimeException("You are already registered in this course.");
        }

        // Register the student in the course
        CourseEnrollment enrollment = new CourseEnrollment(student, course, EnrollmentStatus.ENROLLED);
        courseEnrollmentRepository.save(enrollment);

        // Automatically create a Grade sheet
        Grade grade = new Grade();
        grade.setStudent(enrollment.getStudent());
        grade.setCourse(enrollment.getCourse());
        gradeRepository.save(grade);
    }

    // Drop course
    public void dropCourse(Long studentId, Long courseId) {
        // Check if the student is enrolled in the course
        CourseEnrollment enrollment = courseEnrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course."));

        // Check if the course has already been dropped
        if (enrollment.getStatus() == EnrollmentStatus.DROPPED) {
            throw new RuntimeException("This course has already been dropped.");
        }

        // Check if within drop deadline
        if (LocalDateTime.now().isAfter(enrollment.getCourse().getDropDeadline())) {
            throw new RuntimeException("Drop deadline has passed. Cannot drop the course.");
        }

        // Update the enrollment status and set drop timestamp
        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollment.setDroppedAt(LocalDateTime.now());

        courseEnrollmentRepository.save(enrollment);
    }

    // Check enrollment status
    public String getEnrollmentStatus(Long studentId, Long courseId) {
        return courseEnrollmentRepository.findByStudentId(studentId).stream()
                .filter(enrollment -> enrollment.getCourse().getId().equals(courseId))
                .findFirst()
                .map(enrollment -> enrollment.getStatus() == EnrollmentStatus.DROPPED ? "DROPPED" : "ENROLLED")
                .orElse("NOT_ENROLLED"); // Default to NOT_ENROLLED if no record found
    }

    // View all registered course
    public List<StudentCourseDTO> getStudentCourses(Long studentId) {
        List<Course> enrolledCourses = courseEnrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(CourseEnrollment::getCourse)
                .toList();

        return courseEnrollmentRepository.findByStudentId(studentId)
                .stream()
                .map(enrollment -> new StudentCourseDTO(
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getCourseCode(),
                        enrollment.getCourse().getCourseName(),
                        enrollment.getCourse().getCourseDescription(),
                        enrollment.getCourse().getCategory(),
                        enrollment.getStatus().name(),
                        enrollment.getEnrolledAt(),
                        enrollment.getDroppedAt(),
                        enrollment.getCourse().getLecturers().stream()
                                .map(lecturer -> new LecturerInfoDTO(
                                        lecturer.getId(),
                                        lecturer.getFirstName(),
                                        lecturer.getLastName(),
                                        lecturer.getEmail(),
                                        lecturer.getPhoneNumber()
                                ))
                                .toList()

                ))
                .toList();
    }

    // View all enrolled course
    public List<StudentCourseDTO> getEnrolledCourses(Long studentId) {
        return courseEnrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.ENROLLED)
                .stream()
                .map(enrollment -> new StudentCourseDTO(
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getCourseCode(),
                        enrollment.getCourse().getCourseName(),
                        enrollment.getCourse().getCourseDescription(),
                        enrollment.getCourse().getCategory(),
                        enrollment.getStatus().name(),
                        enrollment.getEnrolledAt(),
                        enrollment.getDroppedAt(),
                        enrollment.getCourse().getLecturers().stream()
                                .map(lecturer -> new LecturerInfoDTO(
                                        lecturer.getId(),
                                        lecturer.getFirstName(),
                                        lecturer.getLastName(),
                                        lecturer.getEmail(),
                                        lecturer.getPhoneNumber()
                                ))
                                .toList()

                ))
                .toList();
    }

    // View all dropped course
    public List<StudentCourseDTO> getDroppedCourses(Long studentId) {
        return courseEnrollmentRepository.findByStudentIdAndStatus(studentId, EnrollmentStatus.DROPPED)
                .stream()
                .map(enrollment -> new StudentCourseDTO(
                        enrollment.getCourse().getId(),
                        enrollment.getCourse().getCourseCode(),
                        enrollment.getCourse().getCourseName(),
                        enrollment.getCourse().getCourseDescription(),
                        enrollment.getCourse().getCategory(),
                        enrollment.getStatus().name(),
                        enrollment.getEnrolledAt(),
                        enrollment.getDroppedAt(),
                        enrollment.getCourse().getLecturers().stream()
                                .map(lecturer -> new LecturerInfoDTO(
                                        lecturer.getId(),
                                        lecturer.getFirstName(),
                                        lecturer.getLastName(),
                                        lecturer.getEmail(),
                                        lecturer.getPhoneNumber()
                                ))
                                .toList()

                ))
                .toList();
    }

    // View all course performance

}
