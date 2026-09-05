package com.project.platform.controller;

import com.project.platform.dto.request.*;
import com.project.platform.dto.response.AdminStatusResponse;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.AuthResponse;
import com.project.platform.entity.enums.Role;
import com.project.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/admin/status")
    public ApiResponse<AdminStatusResponse> getAdminStatus() {
        return ApiResponse.ok("Admin status retrieved", authService.checkAdminStatus());
    }

    @PostMapping("/admin/setup")
    public ApiResponse<AuthResponse> setupAdmin(@Valid @RequestBody AdminSetupRequest request) {
        AuthResponse response = authService.setupAdmin(request);
        return ApiResponse.ok("Admin account created successfully", response);
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ApiResponse.ok("Login successful", response);
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @PostMapping("/admin/login")
    public ApiResponse<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AuthResponse response = authService.login(new LoginRequest(request.email(), request.password()));
            if (!Role.ADMIN.name().equals(response.role())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account does not have administrator access");
            }
            return ApiResponse.ok("Admin login successful", response);
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }
    }

    @PostMapping("/student/login")
    public ApiResponse<AuthResponse> studentLogin(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request, Role.STUDENT.name());
            return ApiResponse.ok("Student login successful", response);
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @PostMapping("/faculty/login")
    public ApiResponse<AuthResponse> facultyLogin(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request, Role.FACULTY.name());
            return ApiResponse.ok("Faculty login successful", response);
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @PostMapping("/register/student")
    public ApiResponse<AuthResponse> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        AuthResponse response = authService.registerStudent(request);
        return ApiResponse.ok("Student registered successfully", response);
    }

    @PostMapping("/register/faculty")
    public ApiResponse<AuthResponse> registerFaculty(@Valid @RequestBody RegisterFacultyRequest request) {
        AuthResponse response = authService.registerFaculty(request);
        return ApiResponse.ok("Faculty registered successfully", response);
    }
}
