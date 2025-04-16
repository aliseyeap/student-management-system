package com.example.student_result_tracking_backend.mapper;

import com.example.student_result_tracking_backend.dto.CourseEnrollmentDTO;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import org.springframework.stereotype.Component;

@Component
public class CourseEnrollmentMapper {
    public CourseEnrollmentDTO toDto(CourseEnrollment enrollment) {
        if (enrollment == null) {
            return null;
        }
        return new CourseEnrollmentDTO(
                enrollment.getId(),
                enrollment.getStudent().getId(),
                enrollment.getStudent().getFirstName().concat(" " + enrollment.getStudent().getLastName()),
                enrollment.getCourse().getId(),
                enrollment.getCourse().getCourseName(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt(),
                enrollment.getDroppedAt()
        );
    }
}
