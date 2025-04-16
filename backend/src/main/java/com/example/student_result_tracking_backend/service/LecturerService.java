package com.example.student_result_tracking_backend.service;

import com.example.student_result_tracking_backend.dto.LecturerDTO;
import com.example.student_result_tracking_backend.entity.Lecturer;
import com.example.student_result_tracking_backend.mapper.LecturerMapper;
import com.example.student_result_tracking_backend.repository.LecturerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LecturerService {
    private final LecturerRepository lecturerRepository;
    private final LecturerMapper lecturerMapper;

    @Autowired
    public LecturerService(LecturerRepository lecturerRepository, LecturerMapper lecturerMapper) {
        this.lecturerRepository = lecturerRepository;
        this.lecturerMapper = lecturerMapper;
    }

    // Get all lecturers
    public List<LecturerDTO> getAllLecturers() {
        return lecturerRepository.findAll()
                .stream()
                .map(lecturerMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get lecturer by ID
    public Optional<LecturerDTO> getLecturerById(Long id) {
        return lecturerRepository.findById(id).map(lecturerMapper::toDTO);
    }

    // Get lecturer by Employee ID
    public Optional<LecturerDTO> getLecturerByEmployeeId(String employeeId) {
        return lecturerRepository.findByEmployeeId(employeeId).map(lecturerMapper::toDTO);
    }

    // Save or update lecturer
    public LecturerDTO saveLecturer(LecturerDTO lecturerDTO) {
        Lecturer lecturer = lecturerMapper.toEntity(lecturerDTO);
        Lecturer savedLecturer = lecturerRepository.save(lecturer);
        return lecturerMapper.toDTO(savedLecturer);
    }

    // Delete lecturer by ID
    public void deleteLecturer(Long id) {
        if (!lecturerRepository.existsById(id)) {
            throw new IllegalArgumentException("Lecturer with ID " + id + " not found");
        }
        lecturerRepository.deleteById(id);
    }

    // Get Lecturer entity by ID (used internally)
    public Optional<Lecturer> getLecturerEntityById(Long id) {
        return lecturerRepository.findById(id);
    }

    public Optional<Lecturer> getLecturerByEmail(String email) {
        return lecturerRepository.findByEmail(email);
    }
}
