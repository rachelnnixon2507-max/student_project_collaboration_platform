package com.project.platform.service;

import com.project.platform.dto.request.*;
import com.project.platform.dto.response.AdminStatusResponse;
import com.project.platform.dto.response.AuthResponse;

public interface AuthService {
    AdminStatusResponse checkAdminStatus();
    AuthResponse setupAdmin(AdminSetupRequest request);
    AuthResponse registerStudent(RegisterStudentRequest request);
    AuthResponse registerFaculty(RegisterFacultyRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse login(LoginRequest request, String requiredRole);
}
