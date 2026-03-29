package com.library.management.auth;

import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.entity.Member;
import com.library.management.repository.MemberRepository;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        Role userRole = Role.USER;
        if (request.getRole() != null) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore, fallback to USER
            }
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();
                
        repository.save(user);
        
        // Also create a basic member record for the new user
        if (user.getRole() == Role.USER) {
            var member = new Member();
            member.setName(user.getFirstName() + " " + user.getLastName());
            member.setEmail(user.getEmail());
            memberRepository.save(member);
        }

        var jwtToken = jwtService.generateToken(user);
        String memberId = memberRepository.findByEmail(user.getEmail())
                .map(Member::getId)
                .orElse(null);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .memberId(memberId)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        
        // Ensure a member record exists for this user
        var memberOpt = memberRepository.findByEmail(user.getEmail());
        String memberId;
        if (memberOpt.isEmpty()) {
            var member = new Member();
            member.setName(user.getFirstName() + " " + user.getLastName());
            member.setEmail(user.getEmail());
            member = memberRepository.save(member);
            memberId = member.getId();
        } else {
            memberId = memberOpt.get().getId();
        }

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .memberId(memberId)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
    public void forgotPassword(ForgotPasswordRequest request) {
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        repository.save(user);
        
        // In a real app, send actual email. For now, we'll log it or assume it's sent.
        System.out.println("Reset token for " + user.getEmail() + ": " + token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        var user = repository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        repository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        var user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password does not match");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        repository.save(user);
    }
}
