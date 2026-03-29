package com.library.management;

import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(UserRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (repository.findByEmail("admin@lib").isEmpty()) {
                var admin = User.builder()
                        .firstName("Admin")
                        .lastName("User")
                        .email("admin@lib")
                        .password(passwordEncoder.encode("admin@123"))
                        .role(Role.ADMIN)
                        .build();
                repository.save(admin);
            }
        };
    }

    // CORS is now handled in SecurityConfig.java

}
