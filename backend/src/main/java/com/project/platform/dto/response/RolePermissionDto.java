package com.project.platform.dto.response;

import com.project.platform.entity.enums.Role;
import java.util.List;

public record RolePermissionDto(
    Role role,
    List<String> permissions
) {}
