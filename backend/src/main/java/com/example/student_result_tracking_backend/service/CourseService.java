package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.entity.Course;
import com.example.student_result_tracking_backend.entity.Lecturer;
import com.example.student_result_tracking_backend.mapper.AssignLecturerMapper;
import com.example.student_result_tracking_backend.mapper.CourseMapper;
import com.example.student_result_tracking_backend.repository.CourseRepository;
import com.example.student_result_tracking_backend.repository.LecturerRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {
    private final CourseRepository courseRepository;
    private final LecturerRepository lecturerRepository;
    private final CourseMapper courseMapper;
    private final AssignLecturerMapper assignLecturerMapper;

    public CourseService(CourseRepository courseRepository, LecturerRepository lecturerRepository,
                         CourseMapper courseMapper, AssignLecturerMapper assignLecturerMapper) {
        this.courseRepository = courseRepository;
        this.lecturerRepository = lecturerRepository;
        this.courseMapper = courseMapper;
        this.assignLecturerMapper = assignLecturerMapper;
    }

    // Get all courses
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(courseMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get courses by category
    public List<CourseDTO> getCoursesByCategory(String category) {
        List<Course> courses = courseRepository.findByCategoryIgnoreCase(category);
        return courses.stream()
                .map(course -> {
                    return new CourseDTO(
                            course.getId(),
                            course.getCourseCode(),
                            course.getCourseName(),
                            course.getCourseDescription(),
                            course.getCategory(),
                            course.getMaxStudents(),
                            course.getCreatedAt(),
                            course.getUpdatedAt(),
                            course.getEnrollmentStart(),
                            course.getEnrollmentEnd(),
                            course.getDropDeadline(),
                            course.getMaxStudents() == course.getEnrollments().size()
                    );
                })
                .collect(Collectors.toList());
    }

    // Get courses that have at least one lecturer assigned
    public List<Course> getCoursesWithAssignedLecturers() {
        return courseRepository.findByLecturersIsNotEmpty();
    }

    // Get course by ID
    public Optional<CourseDTO> getCourseById(Long id) {
        return courseRepository.findById(id).map(courseMapper::toDTO);
    }

    public Optional<Course> getCourseEntityById(Long courseId) {
        return courseRepository.findById(courseId);
    }

    public Optional<CourseDTO> getCourseByCourseCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode).map(courseMapper::toDTO);
    }

    public List<Course> getCoursesByLecturerId(Long lecturerId) {
        return courseRepository.findByLecturers_Id(lecturerId);
    }

    // Save course
    public CourseDTO saveCourse(CourseDTO courseDTO) {
        Course course = courseMapper.toEntity(courseDTO);
        return courseMapper.toDTO(courseRepository.save(course));
    }

    // Update course
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public CourseDTO updateCourse(Long id, Map<String, Object> updates) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        updates.forEach((key, value) -> {
            switch (key) {
                case "courseCode" -> course.setCourseCode((String) value);
                case "courseName" -> course.setCourseName((String) value);
                case "courseDescription" -> course.setCourseDescription((String) value);
                case "category" -> course.setCategory((String) value);
                case "maxStudents" -> course.setMaxStudents((Integer) value);
                case "enrollmentStart" ->
                        course.setEnrollmentStart(LocalDateTime.parse((String) value, formatter));
                case "enrollmentEnd" ->
                        course.setEnrollmentEnd(LocalDateTime.parse((String) value, formatter));
                case "dropDeadline" ->
                        course.setDropDeadline(LocalDateTime.parse((String) value, formatter));
            }
        });

        return courseMapper.toDTO(courseRepository.save(course));
    }

    // Delete Course
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public boolean isEnrollmentPeriodValid(Course course) {
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(course.getEnrollmentStart()) && now.isBefore(course.getEnrollmentEnd());
    }

    public boolean isDropPeriodValid(Course course) {
        LocalDateTime now = LocalDateTime.now();
        return now.isBefore(course.getDropDeadline());
    }

    // Get all courses with assignment
    public List<CourseWithLecturerDTO> getAllCoursesWithLecturer() {
        List<Course> courses = courseRepository.findAllWithLecturer();

        return courses.stream()
                .map(course -> {
                    String lecturerNames = course.getLecturers().stream()
                            .map(l -> l.getFirstName() + " " + l.getLastName())
                            .collect(Collectors.joining(", "));

                    String lecturerEmails = course.getLecturers().stream()
                            .map(Lecturer::getEmail)
                            .collect(Collectors.joining(", "));

                    String lecturerPhoneNumbers = course.getLecturers().stream()
                            .map(Lecturer::getPhoneNumber)
                            .collect(Collectors.joining(", "));

                    return new CourseWithLecturerDTO(
                            course.getId(),
                            course.getCourseCode(),
                            course.getCourseName(),
                            lecturerNames.isEmpty() ? "Not Assigned" : lecturerNames,
                            lecturerEmails.isEmpty() ? "N/A" : lecturerEmails,
                            lecturerPhoneNumbers.isEmpty() ? "N/A" : lecturerPhoneNumbers
                    );
                })
                .collect(Collectors.toList());
    }

    // Get assigned course
    public List<CourseWithLecturerDTO> getAssignedCourses() {
        List<Course> assignedCourses = courseRepository.findByLecturersIsNotNull();
        return assignedCourses.stream()
                .map(course -> {
                    // Extract lecturer information
                    String lecturerNames = course.getLecturers().stream()
                            .map(l -> l.getFirstName() + " " + l.getLastName())
                            .collect(Collectors.joining(", "));

                    String lecturerEmails = course.getLecturers().stream()
                            .map(Lecturer::getEmail)
                            .collect(Collectors.joining(", "));

                    String lecturerPhoneNumbers = course.getLecturers().stream()
                            .map(Lecturer::getPhoneNumber)
                            .collect(Collectors.joining(", "));

                    return new CourseWithLecturerDTO(
                            course.getId(),
                            course.getCourseCode(),
                            course.getCourseName(),
                            lecturerNames.isEmpty() ? "Not Assigned" : lecturerNames,
                            lecturerEmails.isEmpty() ? "N/A" : lecturerEmails,
                            lecturerPhoneNumbers.isEmpty() ? "N/A" : lecturerPhoneNumbers
                    );
                })
                .collect(Collectors.toList());
    }

    // Get unassigned course
    public List<CourseWithLecturerDTO> getUnassignedCourses() {
        List<Course> unassignedCourses = courseRepository.findByLecturersIsNull();
        return unassignedCourses.stream()
                .map(course -> new CourseWithLecturerDTO(
                        course.getId(),
                        course.getCourseCode(),
                        course.getCourseName(),
                        "Not Assigned",
                        "N/A",
                        "N/A"
                ))
                .collect(Collectors.toList());
    }

    // Check if a lecturer is assigned to a course
    public boolean isLecturerAssignedToCourse(Long lecturerId, Long courseId) {
        return courseRepository.existsByIdAndLecturers_Id(courseId, lecturerId);
    }

    public List<AvailableCourseDTO> getAvailableCourses() {
        List<Course> courses = courseRepository.findByLecturersIsNotNull();
        return courses.stream()
                .map(course -> new AvailableCourseDTO(
                        course.getId(),
                        course.getCourseCode(),
                        course.getCourseName(),
                        course.getCourseDescription(),
                        course.getCategory(),
                        course.getMaxStudents(),
                        course.getEnrollmentStart(),
                        course.getEnrollmentEnd(),
                        course.getDropDeadline(),
                        course.getLecturers().stream()
                                .map(lecturer -> new LecturerInfoDTO(
                                        lecturer.getId(),
                                        lecturer.getFirstName(),
                                        lecturer.getLastName(),
                                        lecturer.getEmail(),
                                        lecturer.getPhoneNumber()
                                )).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }
}
