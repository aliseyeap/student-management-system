package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);

    @Query("SELECT s.studentId FROM Student s ORDER BY s.id DESC LIMIT 1")
    Optional<String> findLastStudentId();

    Optional<Student> findByEmail(String email);

    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.enrollments")
    List<Student> findAllWithEnrollments();
}
