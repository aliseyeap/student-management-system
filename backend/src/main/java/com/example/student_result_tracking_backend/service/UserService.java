package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.entity.*;
import com.example.student_result_tracking_backend.exception.UserNotFoundException;
import com.example.student_result_tracking_backend.enums.UserRole;
import com.example.student_result_tracking_backend.repository.LecturerRepository;
import com.example.student_result_tracking_backend.repository.StudentRepository;
import com.example.student_result_tracking_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       LecturerRepository lecturerRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.lecturerRepository = lecturerRepository;
        this.studentRepository = studentRepository;
    }

    // Login
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        return new UserDTO(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getPhoneNumber(), user.getRole(), user.getIsActive());
    }

    // Get user by ID
    public Optional<UserDTO> getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> new UserDTO(
                        user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                        user.getPhoneNumber(), user.getRole(), user.getIsActive()
                ));
    }

    // Generate Employee ID
    private String generateEmployeeId() {
        Optional<String> lastEmployeeId = lecturerRepository.findLastEmployeeId();
        int nextId = lastEmployeeId.map(id -> Integer.parseInt(id.substring(2)) + 1).orElse(1);
        return String.format("L-%04d", nextId);
    }

    // Generate next Student ID
    private String generateStudentId() {
        Optional<String> lastStudentId = studentRepository.findLastStudentId();
        int nextId = lastStudentId.map(id -> Integer.parseInt(id.substring(2)) + 1).orElse(1);
        return String.format("S-%04d", nextId);
    }

    // Create Lecturer
    @Transactional
    public LecturerDTO createLecturer(LecturerDTO lecturerDTO) {
        if (lecturerDTO.getPassword() == null || lecturerDTO.getPassword().isBlank()) {
            throw new RuntimeException("Password is required for lecturers");
        }

        Lecturer lecturer = new Lecturer();
        lecturer.setEmail(lecturerDTO.getEmail());
        lecturer.setFirstName(lecturerDTO.getFirstName());
        lecturer.setLastName(lecturerDTO.getLastName());
        lecturer.setPhoneNumber(lecturerDTO.getPhoneNumber());
        lecturer.setPassword(passwordEncoder.encode(lecturerDTO.getPassword()));
        lecturer.setRole(UserRole.LECTURER);
        lecturer.setEmployeeId(generateEmployeeId());
        lecturer.setIsActive(true);

        Lecturer savedLecturer = lecturerRepository.save(lecturer);

        return new LecturerDTO(
                savedLecturer.getId(), savedLecturer.getEmail(), savedLecturer.getFirstName(),
                savedLecturer.getLastName(), savedLecturer.getPhoneNumber(), savedLecturer.getEmployeeId(),
                savedLecturer.getPassword(), savedLecturer.getCourses() != null ?
                savedLecturer.getCourses().stream().map(Course::getId).collect(Collectors.toSet()) : null,
                savedLecturer.getIsActive()
        );
    }

    // Create student
    @Transactional
    public StudentDTO createStudent(StudentDTO studentDTO) {
        if (studentDTO.getPassword() == null || studentDTO.getPassword().isBlank()) {
            throw new RuntimeException("Password is required for students");
        }

        Student student = new Student();
        student.setEmail(studentDTO.getEmail());
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setPhoneNumber(studentDTO.getPhoneNumber());
        student.setPassword(passwordEncoder.encode(studentDTO.getPassword()));
        student.setRole(UserRole.STUDENT);
        student.setStudentId(generateStudentId());
        student.setIsActive(true);

        Student savedStudent = studentRepository.save(student);

        return new StudentDTO(
                savedStudent.getId(), savedStudent.getEmail(), savedStudent.getFirstName(),
                savedStudent.getLastName(), savedStudent.getPhoneNumber(), savedStudent.getStudentId(),
                savedStudent.getPassword(), savedStudent.getEnrollments() != null ?
                savedStudent.getEnrollments().stream().map(CourseEnrollment::getId).collect(Collectors.toSet()) : null,
                savedStudent.getIsActive()
        );
    }

    // Delete user
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        userRepository.deleteById(userId);
    }

    // Update user details (except password)
    @Transactional
    public UserDTO updateUser(Long userId, Map<String, Object> updates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        updates.forEach((key, value) -> {
            switch (key) {
                case "email" -> user.setEmail((String) value);
                case "firstName" -> user.setFirstName((String) value);
                case "lastName" -> user.setLastName((String) value);
                case "phoneNumber" -> user.setPhoneNumber((String) value);
                case "isActive" -> user.setIsActive((Boolean) value);
                case "role" -> user.setRole(UserRole.valueOf((String) value));
                default -> throw new IllegalArgumentException("Invalid field: " + key);
            }
        });

        User updatedUser = userRepository.save(user);

        return new UserDTO(
                updatedUser.getId(), updatedUser.getEmail(), updatedUser.getFirstName(),
                updatedUser.getLastName(), updatedUser.getPhoneNumber(),
                updatedUser.getRole(), updatedUser.getIsActive()
        );
    }


    // Active and deactivate account
    public void setUserStatus(Long userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        user.setIsActive(isActive);
        userRepository.save(user);
    }

    // Get all user
    public List<UserListDTO> getAllUsers() {
        return userRepository.findByRoleIn(List.of(UserRole.STUDENT, UserRole.LECTURER)).stream()
                .map(user -> new UserListDTO(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole(),
                        user.isPasswordResetRequired()))
                .collect(Collectors.toList());
    }

    // User reset password
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if the new password is the same as the current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // User change password
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if old password matches
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect.");
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match.");
        }

        // Ensure the new password is different from the old password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password cannot be the same as the old password.");
        }

        // Encode the new password and save it
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // User update profile
    @Transactional
    public UserDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        User updatedUser = userRepository.save(user);

        return new UserDTO(
                updatedUser.getId(), updatedUser.getEmail(), updatedUser.getFirstName(),
                updatedUser.getLastName(), updatedUser.getPhoneNumber(),
                updatedUser.getRole(), updatedUser.getIsActive()
        );
    }

    // View user profile
    public UserDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserDTO(
                user.getId(), user.getEmail(), user.getFirstName(),
                user.getLastName(), user.getPhoneNumber(),
                user.getRole(), user.getIsActive()
        );
    }

    // Get list of students
    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents() {
        List<Student> students = studentRepository.findAllWithEnrollments();

        return students.stream()
                .map(student -> new StudentDTO(
                        student.getId(),
                        student.getEmail(),
                        student.getFirstName(),
                        student.getLastName(),
                        student.getPhoneNumber(),
                        student.getStudentId(),
                        student.getPassword(),
                        student.getEnrollments().stream()
                        .map(CourseEnrollment::getId).collect(Collectors.toSet()),
                        student.getIsActive()
                ))
                .collect(Collectors.toUnmodifiableList()); // Prevent modifications
    }

    // Get all lecturers
    public List<LecturerDTO> getAllLecturers() {
        return lecturerRepository.findAll().stream()
                .map(lecturer -> new LecturerDTO(
                        lecturer.getId(), lecturer.getEmail(), lecturer.getFirstName(),
                        lecturer.getLastName(), lecturer.getPhoneNumber(), lecturer.getEmployeeId(),
                        lecturer.getPassword(), lecturer.getCourses().stream()
                        .map(Course::getId).collect(Collectors.toSet()), lecturer.getIsActive()
                )).collect(Collectors.toList());
    }

    // Get recent users
    public List<RecentUserDTO> getRecentUsers(int count) {
        return userRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(count)
                .map(user -> new RecentUserDTO(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
