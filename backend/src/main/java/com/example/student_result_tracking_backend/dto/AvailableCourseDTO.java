package com.example.student_result_tracking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableCourseDTO {
    private Long id;
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private String category;
    private int maxStudents;
    private LocalDateTime enrollmentStart;
    private LocalDateTime enrollmentEnd;
    private LocalDateTime dropDeadline;
    private List<LecturerInfoDTO> lecturers;
}
