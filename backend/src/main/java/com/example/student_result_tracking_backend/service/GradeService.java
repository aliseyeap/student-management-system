package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.GradeDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.entity.Student;
import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import com.example.student_result_tracking_backend.enums.GradeEnum;
import com.example.student_result_tracking_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GradeService {
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseEnrollmentService enrollmentService;

    @Autowired
    public GradeService(GradeRepository gradeRepository, StudentRepository studentRepository,
                        CourseRepository courseRepository, LecturerRepository lecturerRepository,
                        CourseEnrollmentRepository courseEnrollmentRepository,
                        CourseEnrollmentService enrollmentService) {
        this.gradeRepository = gradeRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.lecturerRepository = lecturerRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.enrollmentService = enrollmentService;
    }

    // Assign scores (if not already assigned)
    public GradeDTO assignGrade(Long lecturerId, Long studentId, Long courseId, String examType, Double score) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if lecturer is assigned to the course
        if (course.getLecturers().stream().noneMatch(l -> l.getId().equals(lecturerId))) {
            throw new RuntimeException("You do not have permission to grade this course.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if the student is enrolled in this course
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is not enrolled in this course.");
        }

        // Check enrollment status
        EnrollmentStatus status = enrollmentService.getEnrollmentStatus(studentId, courseId);
        if (status == EnrollmentStatus.DROPPED) {
            throw new RuntimeException("Student has dropped the course. Grade update is not allowed.");
        }

        // Find existing grade or create a new one with null scores
        Grade grade = gradeRepository.findByStudentAndCourse(student, course)
                .orElseGet(() -> {
                    Grade newGrade = new Grade();
                    newGrade.setStudent(student);
                    newGrade.setCourse(course);
                    newGrade.setQuizScore(null);
                    newGrade.setMidTermScore(null);
                    newGrade.setFinalExamScore(null);
                    newGrade.setFinalTotalScore(0.0);
                    newGrade.setFinalGrade(GradeEnum.NA);
                    return newGrade;
                });

        // Check if the exam type already has a score assigned
        if (isScoreAlreadyAssigned(grade, examType)) {
            throw new RuntimeException("Score for " + examType + " already exists. Use update method instead.");
        }

        // Assign score
        setExamScore(grade, examType, score);

        Grade savedGrade = gradeRepository.save(grade);
        return convertToDTO(savedGrade);
    }

    // Update scores (only if a score already exists)
    public GradeDTO updateGrade(Long lecturerId, Long studentId, Long courseId, String examType, Double score) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Check if lecturer is assigned to the course
        if (course.getLecturers().stream().noneMatch(l -> l.getId().equals(lecturerId))) {
            throw new RuntimeException("You do not have permission to grade this course.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if the student is enrolled in this course
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is not enrolled in this course.");
        }

        // Check enrollment status
        EnrollmentStatus status = enrollmentService.getEnrollmentStatus(studentId, courseId);
        if (status == EnrollmentStatus.DROPPED) {
            throw new RuntimeException("Student has dropped the course. Grade update is not allowed.");
        }

        Grade grade = gradeRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new RuntimeException("Grade entry not found. Please assign first."));

        // Prevent updating if there is no existing score
        if (!isScoreAlreadyAssigned(grade, examType)) {
            throw new RuntimeException("Score for " + examType + " has not been assigned yet. Use assign method first.");
        }

        // Update score
        setExamScore(grade, examType, score);

        Grade updatedGrade = gradeRepository.save(grade);
        return convertToDTO(updatedGrade);
    }

    // View all student grades for a lecturer's assigned courses
    public List<GradeDTO> getAllStudentGradesForLecturer(Long lecturerId) {
        // Find all courses assigned to the lecturer
        List<Course> lecturerCourses = courseRepository.findByLecturers_Id(lecturerId);

        // Fetch all grades for those courses
        List<Grade> grades = gradeRepository.findByCourseIn(lecturerCourses);

        // Convert to DTO
        return grades.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get all student grades for a specific course assigned to the lecturer
    public List<GradeDTO> getStudentGradesByCourse(Long lecturerId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Ensure the lecturer is assigned to this course
        if (course.getLecturers().stream().noneMatch(l -> l.getId().equals(lecturerId))) {
            throw new RuntimeException("You do not have permission to view grades for this course.");
        }

        List<Grade> grades = gradeRepository.findByCourse(course);

        return grades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GradeDTO getStudentPerformance(Long lecturerId, Long studentId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Ensure the lecturer is assigned to this course
        if (course.getLecturers().stream().noneMatch(l -> l.getId().equals(lecturerId))) {
            throw new RuntimeException("You do not have permission to view grades for this course.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Ensure the student is enrolled in the course
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is not enrolled in this course.");
        }

        // Retrieve the student's grade
        Grade grade = gradeRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new RuntimeException("No grade entry found for this student in this course."));

        return convertToDTO(grade);
    }

    // Fetch all student grades
    public List<GradeDTO> getAllStudentGrades() {
        List<Grade> grades = gradeRepository.findAll();
        return grades.stream()
                .map(GradeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Fetch all student grades for a specific course
    public List<GradeDTO> getStudentGradesByCourse(Long courseId) {
        List<Grade> grades = gradeRepository.findByCourseId(courseId);
        return grades.stream()
                .map(GradeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Student view all their course performance
    public List<GradeDTO> getStudentGrades(Long studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        return grades.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Student view course performance of specific course
    public Optional<Grade> getStudentGradeForCourse(Long studentId, Long courseId) {
        return gradeRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    // Helper function to check if the score already exists
    private boolean isScoreAlreadyAssigned(Grade grade, String examType) {
        switch (examType.toLowerCase()) {
            case "quiz" -> {
                return grade.getQuizScore() != null;
            }
            case "midterm" -> {
                return grade.getMidTermScore() != null;
            }
            case "final" -> {
                return grade.getFinalExamScore() != null;
            }
            default -> throw new IllegalArgumentException("Invalid exam type: " + examType);
        }
    }

    // Helper function to set the score for the specified exam type
    private void setExamScore(Grade grade, String examType, Double score) {
        switch (examType.toLowerCase()) {
            case "quiz":
                grade.setQuizScore(score);
                break;
            case "midterm":
                grade.setMidTermScore(score);
                break;
            case "final":
                grade.setFinalExamScore(score);
                break;
            default:
                throw new IllegalArgumentException("Invalid exam type: " + examType);
        }
    }

    // Convert Grade entity to DTO
    private GradeDTO convertToDTO(Grade grade) {
        return new GradeDTO(
                grade.getStudent().getId(),
                grade.getCourse().getId(),
                grade.getQuizScore(),
                grade.getMidTermScore(),
                grade.getFinalExamScore(),
                grade.getFinalTotalScore(),
                grade.getFinalGrade()
        );
    }
}
