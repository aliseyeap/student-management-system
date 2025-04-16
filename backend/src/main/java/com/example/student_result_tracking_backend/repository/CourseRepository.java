package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);

    List<Course> findByLecturersIsNotEmpty();

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.lecturers")
    List<Course> findAllWithLecturer();

    // Find courses by lecturer ID
    List<Course> findByLecturers_Id(Long lecturerId);

    // Find courses by category
    @Query("SELECT c FROM Course c WHERE LOWER(c.category) = LOWER(:category)")
    List<Course> findByCategoryIgnoreCase(@Param("category") String category);

    // Find courses assigned to lecturers
    List<Course> findByLecturersIsNotNull();

    // Find courses not assigned to any lecturer
    List<Course> findByLecturersIsNull();

    // Check if a course exists and is assigned to a specific lecturer
    boolean existsByIdAndLecturers_Id(Long courseId, Long lecturerId);

}
