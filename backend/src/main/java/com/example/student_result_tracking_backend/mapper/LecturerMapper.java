package com.example.student_result_tracking_backend.mapper;

import com.example.student_result_tracking_backend.dto.LecturerDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Lecturer;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class LecturerMapper {
    public LecturerDTO toDTO(Lecturer lecturer) {
        LecturerDTO dto = new LecturerDTO();
        dto.setId(lecturer.getId());
        dto.setEmployeeId(lecturer.getEmployeeId());
        dto.setCourseIds(lecturer.getCourses().stream().map(Course::getId).collect(Collectors.toSet()));
        return dto;
    }

    public Lecturer toEntity(LecturerDTO dto) {
        Lecturer lecturer = new Lecturer();
        lecturer.setId(dto.getId());
        lecturer.setEmployeeId(dto.getEmployeeId());
        return lecturer;
    }
}
