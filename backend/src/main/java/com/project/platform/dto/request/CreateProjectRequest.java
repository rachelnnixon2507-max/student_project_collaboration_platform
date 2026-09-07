package com.project.platform.dto.request;

import com.project.platform.entity.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    String title,

    @Size(max = 4000, message = "Description cannot exceed 4000 characters")
    String description,

    String requiredSkills,

    ProjectStatus status
) {}
