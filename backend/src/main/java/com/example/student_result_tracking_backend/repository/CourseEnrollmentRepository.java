package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import com.example.student_result_tracking_backend.entity.Student;
import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByCourse(Course course);

    List<CourseEnrollment> findByStudentId(Long studentId);

    Optional<CourseEnrollment> findByStudentAndCourse(Student student, Course course);

    boolean existsByStudentAndCourse(Student student, Course course);

    List<CourseEnrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);

    List<CourseEnrollment> findByStudentAndDroppedAtIsNotNull(Student student);

    List<CourseEnrollment> findByStudentAndStatus(Student student, EnrollmentStatus status);

    List<CourseEnrollment> findByCourseIn(List<Course> courses);

    Optional<CourseEnrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    List<CourseEnrollment> findByCourseId(Long courseId);

    // Count enrolled students in a specific course
    int countByCourseAndStatus(Course course, EnrollmentStatus status);

    @Query("SELECT e FROM CourseEnrollment e WHERE e.student.id = :studentId AND e.course.id = :courseId")
    Optional<CourseEnrollment> findEnrollment(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
