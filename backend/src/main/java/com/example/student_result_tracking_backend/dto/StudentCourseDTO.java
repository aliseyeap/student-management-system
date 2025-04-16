package com.example.student_result_tracking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseDTO {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private String category;
    private String enrollmentStatus;
    private LocalDateTime enrolledAt;
    private LocalDateTime droppedAt;
    private List<LecturerInfoDTO> lecturers;
}
