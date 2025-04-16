package com.example.student_result_tracking_backend.dto;

import com.example.student_result_tracking_backend.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private UserRole role;
    private Long id;
    private String firstName;
    private String lastName;
}
