package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, Long> {
    Optional<Lecturer> findByEmployeeId(String employeeId);

    @Query("SELECT l.employeeId FROM Lecturer l ORDER BY l.id DESC LIMIT 1")
    Optional<String> findLastEmployeeId();
    Optional<Lecturer> findByEmail(String email);
}
