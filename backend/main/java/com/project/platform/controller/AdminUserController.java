package com.project.platform.controller;

import com.project.platform.dto.request.UpdateAccountStatusRequest;
import com.project.platform.dto.request.UpdateUserRoleRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.FacultyAdminResponse;
import com.project.platform.dto.response.StudentAdminResponse;
import com.project.platform.dto.response.UserAdminResponse;
import com.project.platform.entity.enums.Role;
import com.project.platform.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Feature 1 (Manage Students & Faculty) + Feature 3 (Manage Roles & Permissions).
 * All endpoints are ADMIN-only (enforced globally in SecurityConfig for /api/admin/**,
 * reinforced here with @PreAuthorize for defense-in-depth).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<Page<UserAdminResponse>> listUsers(
        @RequestParam(required = false) Role role,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.ok(adminUserService.listUsers(role, pageable));
    }

    @GetMapping("/students")
    public ApiResponse<Page<StudentAdminResponse>> listStudents(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(adminUserService.listStudents(pageable));
    }

    @GetMapping("/faculty")
    public ApiResponse<Page<FacultyAdminResponse>> listFaculty(@PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(adminUserService.listFaculty(pageable));
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserAdminResponse> getUser(@PathVariable Long userId) {
        return ApiResponse.ok(adminUserService.getUser(userId));
    }

    @PatchMapping("/{userId}/status")
    public ApiResponse<UserAdminResponse> updateAccountStatus(
        @PathVariable Long userId,
        @Valid @RequestBody UpdateAccountStatusRequest request
    ) {
        return ApiResponse.ok("Account status updated", adminUserService.updateAccountStatus(userId, request.accountStatus()));
    }

    @PatchMapping("/{userId}/role")
    public ApiResponse<UserAdminResponse> updateUserRole(
        @PathVariable Long userId,
        @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        return ApiResponse.ok("Role updated", adminUserService.updateUserRole(userId, request.role()));
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId) {
        adminUserService.deleteUser(userId);
    }
}
