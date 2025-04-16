package com.example.student_result_tracking_backend.dto;

import com.example.student_result_tracking_backend.entity.Grade;
import com.example.student_result_tracking_backend.enums.GradeEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private Long studentId;
    private Long courseId;
    private Double quizScore;
    private Double midTermScore;
    private Double finalExamScore;
    private Double totalScore; // Automatically calculated
    private GradeEnum finalGrade; // Automatically assigned

    // Convert Grade entity to GradeDTO
    public static GradeDTO fromEntity(Grade grade) {
        return new GradeDTO(
                grade.getStudent().getId(),
                grade.getCourse().getId(),
                grade.getQuizScore(),
                grade.getMidTermScore(),
                grade.getFinalExamScore(),
                grade.getFinalTotalScore(),
                grade.getFinalGrade()
        );
    }
}
