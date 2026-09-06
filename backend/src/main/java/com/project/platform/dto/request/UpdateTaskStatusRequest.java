package com.project.platform.dto.request;

import com.project.platform.entity.enums.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for updating task status or completion progress.
 * Owned by Member 2 - Team Collaboration.
 */
public record UpdateTaskStatusRequest(
    @NotNull(message = "status is required")
    TaskStatus status,

    @Min(value = 0, message = "progress must be between 0 and 100")
    @Max(value = 100, message = "progress must be between 0 and 100")
    Integer progress
) {}
