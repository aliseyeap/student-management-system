package com.example.student_result_tracking_backend.entity;

import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import com.example.student_result_tracking_backend.service.CourseEnrollmentService;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Integer version;

    @Column(nullable = false, unique = true)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false)
    private String courseDescription;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private int maxStudents = 35;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "enrollment_start", nullable = false)
    private LocalDateTime enrollmentStart;

    @Column(name = "enrollment_end", nullable = false)
    private LocalDateTime enrollmentEnd;

    @Column(name = "drop_deadline",nullable = false)
    private LocalDateTime dropDeadline;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<CourseEnrollment> enrollments = new HashSet<>();

    @ManyToMany(mappedBy = "courses")
    @JsonBackReference("course-lecturers")
    private Set<Lecturer> lecturers = new HashSet<>();

    @PrePersist
    @PreUpdate
    public void validateCourse() {
        if (maxStudents < 1) {
            throw new IllegalArgumentException("Max students must be at least 1.");
        }
        if (enrollmentStart != null && enrollmentEnd != null && enrollmentEnd.isBefore(enrollmentStart)) {
            throw new IllegalArgumentException("Enrollment end date must be after enrollment start date.");
        }
        if (enrollmentEnd != null && dropDeadline != null && dropDeadline.isBefore(enrollmentEnd)) {
            throw new IllegalArgumentException("Drop deadline must be after the enrollment end date.");
        }
    }

    //Checks if the course is full.
    public boolean isFull(CourseEnrollmentService enrollmentService) {
        int enrolledCount = enrollmentService.getEnrolledStudentCount(this);
        return enrolledCount >= maxStudents;
    }

    public void enrollStudent(CourseEnrollment enrollment) {
        if (!enrollments.contains(enrollment)) {
            this.enrollments.add(enrollment);
            enrollment.setCourse(this);
        }
    }

    public void removeStudent(CourseEnrollment enrollment) {
        enrollments.removeIf(e -> e.getStudent().equals(enrollment.getStudent()));
    }

    public void addEnrollment(CourseEnrollment enrollment) {
        if (!enrollments.contains(enrollment)) {
            this.enrollments.add(enrollment);
            enrollment.setCourse(this);
        }
    }

    // Prevent circular reference in equals & hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Course course = (Course) o;
        return Objects.equals(id, course.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}