package com.example.student_result_tracking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseWithLecturerDTO {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String lecturerName;
    private String lecturerEmail;
    private String lecturerPhoneNumbers;
}
