package com.example.student_result_tracking_backend.entity;

import com.example.student_result_tracking_backend.enums.GradeEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grades", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column
    private Double quizScore;

    @Column
    private Double midTermScore;

    @Column
    private Double finalExamScore;

    @Column(nullable = false)
    private Double finalTotalScore = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradeEnum finalGrade = GradeEnum.NA;

    //Auto calculate total score and finalGrade
    @PrePersist
    @PreUpdate
    public void calculateTotalAndGrade(){
        double quiz = (quizScore != null) ? quizScore : 0.0;
        double midTerm = (midTermScore != null) ? midTermScore : 0.0;
        double finalExam = (finalExamScore != null) ? finalExamScore : 0.0;

        // Weightage: Quiz (20%), Midterm (30%), Final (50%)
        this.finalTotalScore = quiz + midTerm + finalExam;

        // Calculate grade only when all scores are available
        if (quizScore != null && midTermScore != null && finalExamScore != null) {
            this.finalGrade = calculateFinalGrade(this.finalTotalScore);
        }
    }

    private GradeEnum calculateFinalGrade(double totalScore) {
        if (totalScore >= 80) return GradeEnum.A;
        else if (totalScore >= 60) return GradeEnum.B;
        else if (totalScore >= 50) return GradeEnum.C;
        else if (totalScore >= 40) return GradeEnum.D;
        else return GradeEnum.F;
    }
}
