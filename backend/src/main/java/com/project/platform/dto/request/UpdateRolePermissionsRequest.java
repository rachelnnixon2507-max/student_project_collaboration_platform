package com.project.platform.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record UpdateRolePermissionsRequest(
    @NotNull(message = "permissions list is required") List<String> permissions
) {}
