package com.example.student_result_tracking_backend.repository;

import com.example.student_result_tracking_backend.entity.User;
import com.example.student_result_tracking_backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findById(Long userId);

    List<User> findByRoleIn(List<UserRole> roles);

    List<User> findAllByOrderByCreatedAtDesc();
}
