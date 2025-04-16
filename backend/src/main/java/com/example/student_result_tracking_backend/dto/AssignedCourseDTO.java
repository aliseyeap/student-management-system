package com.example.student_result_tracking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AssignedCourseDTO {
    private Long id;
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private String category;
    private int maxStudents;
    private int enrolledStudents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime enrollmentStart;
    private LocalDateTime enrollmentEnd;
    private LocalDateTime dropDeadline;
    private boolean isFull;
}
