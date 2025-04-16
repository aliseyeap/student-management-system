package com.example.student_result_tracking_backend.mapper;

import com.example.student_result_tracking_backend.dto.AssignLecturerDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Lecturer;
import org.springframework.stereotype.Component;

@Component
public class AssignLecturerMapper {
    public AssignLecturerDTO toDTO(Course course, Lecturer lecturer) {
        if (course == null || lecturer == null) {
            return null;
        }
        AssignLecturerDTO dto = new AssignLecturerDTO();
        dto.setCourseId(course.getId());
        dto.setLecturerId(lecturer.getId());
        return dto;
    }
}
