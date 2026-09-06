package com.project.platform.controller;

import com.project.platform.dto.request.UpdateRolePermissionsRequest;
import com.project.platform.dto.response.ApiResponse;
import com.project.platform.dto.response.RolePermissionDto;
import com.project.platform.entity.enums.Role;
import com.project.platform.service.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Feature 3: Manage Roles & Permissions. ADMIN-only persistence endpoint. */
@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RolePermissionController {

    private final RolePermissionService rolePermissionService;

    @GetMapping("/permissions")
    public ApiResponse<Map<Role, List<String>>> getAllRolePermissions() {
        return ApiResponse.ok(rolePermissionService.getAllRolePermissions());
    }

    @GetMapping("/{role}/permissions")
    public ApiResponse<RolePermissionDto> getRolePermissions(@PathVariable Role role) {
        return ApiResponse.ok(rolePermissionService.getPermissionsForRole(role));
    }

    @PutMapping("/{role}/permissions")
    public ApiResponse<RolePermissionDto> updateRolePermissions(
        @PathVariable Role role,
        @Valid @RequestBody UpdateRolePermissionsRequest request
    ) {
        RolePermissionDto updated = rolePermissionService.updateRolePermissions(role, request.permissions());
        return ApiResponse.ok("Role permissions updated successfully", updated);
    }
}
