package com.project.platform.dto.request;

import com.project.platform.entity.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
    @NotNull(message = "role is required") Role role
) {}
