package com.project.platform.dto.request;

import com.project.platform.entity.enums.FileResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for sharing an external resource link (e.g. GitHub repo, Figma, Google Drive).
 * Owned by Member 2 - Team Collaboration.
 */
public record CreateResourceLinkRequest(
    @NotNull(message = "projectId is required")
    Long projectId,

    @NotBlank(message = "fileName is required")
    String fileName,

    @NotBlank(message = "fileUrl is required")
    String fileUrl,

    String description,

    FileResourceType resourceType
) {}
