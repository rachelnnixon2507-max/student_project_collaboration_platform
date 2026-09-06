package com.project.platform.dto.request;

import com.project.platform.entity.enums.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Request payload for creating a new task.
 * Owned by Member 2 - Team Collaboration.
 */
public record CreateTaskRequest(
    @NotNull(message = "projectId is required")
    Long projectId,

    @NotBlank(message = "title is required")
    String title,

    String description,

    Long assignedTo,

    LocalDateTime dueDate,

    TaskStatus status,

    @Min(value = 0, message = "progress must be between 0 and 100")
    @Max(value = 100, message = "progress must be between 0 and 100")
    Integer progress
) {}
