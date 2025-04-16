package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.AssignLecturerDTO;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Lecturer;
import com.example.student_result_tracking_backend.enums.UserRole;
import com.example.student_result_tracking_backend.mapper.AssignLecturerMapper;
import com.example.student_result_tracking_backend.repository.CourseRepository;
import com.example.student_result_tracking_backend.repository.LecturerRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssignLecturerService {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LecturerRepository lecturerRepository;

    @Autowired
    private AssignLecturerMapper assignLecturerMapper;

    @Transactional
    public AssignLecturerDTO assignLecturer(Long courseId, Long lecturerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Lecturer lecturer = lecturerRepository.findById(lecturerId)
                .orElseThrow(() -> new RuntimeException("Lecturer not found"));

        if (!lecturer.getRole().equals(UserRole.LECTURER)) {
            throw new RuntimeException("User is not a lecturer");
        }

        course.getLecturers().add(lecturer);
        lecturer.getCourses().add(course);

        lecturerRepository.save(lecturer);
        courseRepository.save(course);

        return assignLecturerMapper.toDTO(course, lecturer);
    }
}
