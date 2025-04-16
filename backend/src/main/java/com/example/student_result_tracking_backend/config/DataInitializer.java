package com.example.student_result_tracking_backend.config;

import com.example.student_result_tracking_backend.entity.User;
import com.example.student_result_tracking_backend.enums.UserRole;
import com.example.student_result_tracking_backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init(){
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(UserRole.ADMIN);
            admin.setFirstName("Alise");
            admin.setLastName("Yeap");
            admin.setPasswordResetRequired(false);
            admin.setPhoneNumber("0106668330");
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }
    }
}
