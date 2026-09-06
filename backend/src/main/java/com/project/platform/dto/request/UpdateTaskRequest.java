package com.project.platform.dto.request;

import com.project.platform.entity.enums.TaskStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

/**
 * Request payload for updating task details.
 * Owned by Member 2 - Team Collaboration.
 */
public record UpdateTaskRequest(
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
