package com.project.platform.service;

import com.project.platform.dto.response.RolePermissionDto;
import com.project.platform.entity.enums.Role;

import java.util.List;
import java.util.Map;

public interface RolePermissionService {
    Map<Role, List<String>> getAllRolePermissions();
    RolePermissionDto getPermissionsForRole(Role role);
    RolePermissionDto updateRolePermissions(Role role, List<String> permissions);
    boolean hasPermission(Role role, String permission);
}
