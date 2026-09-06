package com.project.platform.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Request payload for assigning/reassigning a task to a student.
 * Owned by Member 2 - Team Collaboration.
 */
public record AssignTaskRequest(
    @NotNull(message = "assignedTo is required")
    Long assignedTo
) {}
