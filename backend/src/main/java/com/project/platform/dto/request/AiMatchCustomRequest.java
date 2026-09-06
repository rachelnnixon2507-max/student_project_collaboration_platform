package com.project.platform.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for ad-hoc candidate matching using custom skill requirements.
 * Owned by Member 2 - Team Collaboration.
 */
public record AiMatchCustomRequest(
    @NotBlank(message = "requiredSkills is required")
    String requiredSkills,

    String department,

    Integer maxResults
) {}
