package com.project.platform.dto.request;

import com.project.platform.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUpdateProjectStatusRequest(
    @NotNull(message = "status is required") ProjectStatus status,
    String reason
) {}
