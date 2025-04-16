package com.example.student_result_tracking_backend.entity;

import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_students", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @Column(name = "enrolled_at", nullable = false, updatable = true)
    @CreationTimestamp
    private LocalDateTime enrolledAt;

    @Column(name = "dropped_at")
    private LocalDateTime droppedAt;

    // Custom constructor to initialize only required fields
    public CourseEnrollment(Student student, Course course, EnrollmentStatus status) {
        this.student = student;
        this.course = course;
        this.status = status;
        this.enrolledAt = LocalDateTime.now();
    }

    // Set status to DROPPED and record timestamp when dropping a course
    public void dropCourse() {
        if (this.status == EnrollmentStatus.DROPPED) {
            throw new IllegalStateException("The student has already dropped this course.");
        }
        this.status = EnrollmentStatus.DROPPED;
        this.droppedAt = LocalDateTime.now();
    }

    // Allow re-enrollment only if the course is not full
    public void reEnroll() {
        if (this.status == EnrollmentStatus.ENROLLED) {
            throw new IllegalStateException("The student is already enrolled in this course.");
        }

        this.status = EnrollmentStatus.ENROLLED;
        this.droppedAt = null;
   }
}
