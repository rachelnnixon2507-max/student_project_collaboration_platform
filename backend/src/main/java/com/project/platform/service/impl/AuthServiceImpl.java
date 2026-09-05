package com.project.platform.service.impl;

import com.project.platform.dto.request.*;
import com.project.platform.dto.response.AdminStatusResponse;
import com.project.platform.dto.response.AuthResponse;
import com.project.platform.entity.FacultyProfile;
import com.project.platform.entity.StudentProfile;
import com.project.platform.entity.User;
import com.project.platform.entity.enums.AccountStatus;
import com.project.platform.entity.enums.Role;
import com.project.platform.exception.BadRequestException;
import com.project.platform.exception.DuplicateResourceException;
import com.project.platform.repository.FacultyProfileRepository;
import com.project.platform.repository.StudentProfileRepository;
import com.project.platform.repository.UserRepository;
import com.project.platform.security.JwtUtil;
import com.project.platform.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AdminStatusResponse checkAdminStatus() {
        boolean exists = userRepository.existsByRole(Role.ADMIN);
        return new AdminStatusResponse(
            exists,
            exists ? "Admin account is configured" : "No admin account configured. First-time setup required."
        );
    }

    @Override
    @Transactional
    public AuthResponse setupAdmin(AdminSetupRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new DuplicateResourceException("Admin account has already been configured.");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("User with email '" + request.email() + "' already exists.");
        }

        User admin = User.builder()
            .name(request.name().trim())
            .email(request.email().trim().toLowerCase())
            .password(passwordEncoder.encode(request.password()))
            .role(Role.ADMIN)
            .accountStatus(AccountStatus.ACTIVE)
            .build();

        admin = userRepository.save(admin);

        String token = jwtUtil.generateToken(admin.getEmail(), admin.getId(), admin.getRole().name());
        return new AuthResponse(token, admin.getId(), admin.getName(), admin.getEmail(), admin.getRole().name());
    }

    @Override
    @Transactional
    public AuthResponse registerStudent(RegisterStudentRequest request) {
        if (request.confirmPassword() != null && !request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String cleanEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateResourceException("User with email '" + cleanEmail + "' already exists.");
        }

        User student = User.builder()
            .name(request.name().trim())
            .email(cleanEmail)
            .password(passwordEncoder.encode(request.password()))
            .role(Role.STUDENT)
            .accountStatus(AccountStatus.ACTIVE)
            .build();

        student = userRepository.save(student);

        if (request.department() != null || request.skills() != null || request.bio() != null) {
            StudentProfile profile = StudentProfile.builder()
                .userId(student.getId())
                .department(request.department())
                .skills(request.skills())
                .bio(request.bio())
                .build();
            studentProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(student.getEmail(), student.getId(), student.getRole().name());
        return new AuthResponse(token, student.getId(), student.getName(), student.getEmail(), student.getRole().name());
    }

    @Override
    @Transactional
    public AuthResponse registerFaculty(RegisterFacultyRequest request) {
        if (request.confirmPassword() != null && !request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        String cleanEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new DuplicateResourceException("User with email '" + cleanEmail + "' already exists.");
        }

        User faculty = User.builder()
            .name(request.name().trim())
            .email(cleanEmail)
            .password(passwordEncoder.encode(request.password()))
            .role(Role.FACULTY)
            .accountStatus(AccountStatus.ACTIVE)
            .build();

        faculty = userRepository.save(faculty);

        if (request.department() != null || request.designation() != null || request.specialization() != null) {
            FacultyProfile profile = FacultyProfile.builder()
                .userId(faculty.getId())
                .department(request.department())
                .designation(request.designation())
                .specialization(request.specialization())
                .build();
            facultyProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(faculty.getEmail(), faculty.getId(), faculty.getRole().name());
        return new AuthResponse(token, faculty.getId(), faculty.getName(), faculty.getEmail(), faculty.getRole().name());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        return login(request, null);
    }

    @Override
    public AuthResponse login(LoginRequest request, String requiredRole) {
        String cleanEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (requiredRole != null && !requiredRole.equalsIgnoreCase(user.getRole().name())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
            throw new BadRequestException("Account has been suspended. Please contact platform administrator.");
        }

        if (user.getAccountStatus() == AccountStatus.DEACTIVATED) {
            throw new BadRequestException("Account is deactivated.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
