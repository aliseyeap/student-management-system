package com.example.student_result_tracking_backend.controller;

import com.example.student_result_tracking_backend.dto.*;
import com.example.student_result_tracking_backend.exception.UserNotFoundException;
import com.example.student_result_tracking_backend.repository.UserRepository;
import com.example.student_result_tracking_backend.service.AuthService;
import com.example.student_result_tracking_backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserService userService, UserRepository userRepository) {
        this.authService = authService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO loginRequest) {
        try {
            System.out.println("Login request received for: " + loginRequest.getEmail());

            String token = authService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
            UserDTO user = userService.getUserByEmail(loginRequest.getEmail());

            System.out.println("Login successful for: " + user.getEmail());

            // Create response with all needed user details
            AuthResponseDTO response = new AuthResponseDTO(
                    token,
                    user.getRole(),
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName()
            );

            return ResponseEntity.ok(response);
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body("Your account is inactive. Please contact the administrator.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid username or password.");
        }
    }

    // Get user by email
    @PostMapping("/check-email")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        try {
            UserDTO userDTO = userService.getUserByEmail(email);

            // Return userId and email if found
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userDTO.getId());
            response.put("email", userDTO.getEmail());

            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "Email not found"));
        }
    }

    // Reset password
    @PutMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }

    // Change password
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        userService.changePassword(userId, request);
        return ResponseEntity.ok("Password changed successfully.");
    }

    // Update profile
    @PutMapping("/update-profile")
    public ResponseEntity<UserDTO> updateProfile(@RequestBody UpdateProfileRequest request, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        UserDTO updatedUser = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    // View user profile
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getUserProfile(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        UserDTO userProfile = userService.getUserProfile(userId);
        return ResponseEntity.ok(userProfile);
    }

    // Helper method to retrieve user ID from the Principal
    private Long getUserIdFromPrincipal(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}