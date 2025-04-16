package com.example.student_result_tracking_backend.mapper;

import com.example.student_result_tracking_backend.dto.CourseDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.CourseEnrollment;
import com.example.student_result_tracking_backend.entity.Lecturer;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CourseMapper {
    public CourseDTO toDTO(Course course) {
        if (course == null) {
            return null;
        }
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setCourseName(course.getCourseName());
        dto.setCourseDescription(course.getCourseDescription());
        dto.setCategory(course.getCategory());
        dto.setMaxStudents(course.getMaxStudents());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        dto.setEnrollmentStart(course.getEnrollmentStart());
        dto.setEnrollmentEnd(course.getEnrollmentEnd());
        dto.setDropDeadline(course.getDropDeadline());

        return dto;
    }

    public Course toEntity(CourseDTO dto) {
        if (dto == null) {
            return null;
        }
        Course course = new Course();
        course.setId(dto.getId());
        course.setCourseCode(dto.getCourseCode());
        course.setCourseName(dto.getCourseName());
        course.setCourseDescription(dto.getCourseDescription());
        course.setCategory(dto.getCategory());
        course.setMaxStudents(dto.getMaxStudents());
        course.setEnrollmentStart(dto.getEnrollmentStart());
        course.setEnrollmentEnd(dto.getEnrollmentEnd());
        course.setDropDeadline(dto.getDropDeadline());

        return course;
    }
}
