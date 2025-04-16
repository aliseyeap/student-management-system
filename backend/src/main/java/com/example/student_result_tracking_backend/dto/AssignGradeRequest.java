package com.example.student_result_tracking_backend.dto;

import lombok.Data;

@Data
public class AssignGradeRequest {
    private Long studentId;
    private Long courseId;
    private String examType;
    private Double quizScore;
    private Double midTermScore;
    private Double finalExamScore;
}
