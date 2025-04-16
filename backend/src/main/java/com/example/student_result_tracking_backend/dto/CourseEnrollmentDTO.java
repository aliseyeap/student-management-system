package com.example.student_result_tracking_backend.dto;

import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseName;
    private EnrollmentStatus status;
    private LocalDateTime enrolledAt;
    private LocalDateTime droppedAt;
}
