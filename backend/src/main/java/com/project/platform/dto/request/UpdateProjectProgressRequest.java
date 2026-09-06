package com.project.platform.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for manually updating or overriding project progress percentage.
 * Owned by Member 2 - Team Collaboration.
 */
public record UpdateProjectProgressRequest(
    @NotNull(message = "overallProgress is required")
    @Min(value = 0, message = "overallProgress must be between 0 and 100")
    @Max(value = 100, message = "overallProgress must be between 0 and 100")
    Integer overallProgress,

    String reason
) {}
