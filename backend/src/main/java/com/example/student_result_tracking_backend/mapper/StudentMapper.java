package com.example.student_result_tracking_backend.mapper;

import com.example.student_result_tracking_backend.dto.StudentDTO;
import com.example.student_result_tracking_backend.entity.Student;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class StudentMapper {
    public StudentDTO toDTO(Student student) {
        if (student == null) {
            return null;
        }
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setStudentId(student.getStudentId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setEnrolledCourseIds(student.getEnrollments().stream()
                .map(enrollment -> enrollment.getCourse().getId()) // Extract course IDs from enrollments
                .collect(Collectors.toSet()));
        return dto;
    }

    public Student toEntity(StudentDTO dto) {
        if (dto == null) {
            return null;
        }
        Student student = new Student();
        student.setId(dto.getId());
        student.setStudentId(dto.getStudentId());
        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        // Course enrollments should be handled separately to avoid Hibernate issues
        return student;
    }
}
