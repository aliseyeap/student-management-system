package com.example.student_result_tracking_backend.dto;

import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import com.example.student_result_tracking_backend.enums.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private String category;
    private int maxStudents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime enrollmentStart;
    private LocalDateTime enrollmentEnd;
    private LocalDateTime dropDeadline;
    private boolean full;
}
