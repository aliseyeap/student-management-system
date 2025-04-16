package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByStudentAndCourse(Student student, Course course);

    List<Grade> findByCourseIn(List<Course> courses);

    List<Grade> findByCourse(Course course);

    List<Grade> findByCourseId(Long courseId);

    List<Grade> findByStudentId(Long studentId);

    Optional<Grade> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
