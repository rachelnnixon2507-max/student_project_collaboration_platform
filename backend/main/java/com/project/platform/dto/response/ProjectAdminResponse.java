package com.project.platform.dto.response;

import com.project.platform.entity.enums.ProjectStatus;

import java.time.LocalDateTime;

public record ProjectAdminResponse(
    Long id,
    String title,
    String description,
    ProjectStatus status,
    Long createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    int memberCount
) {}
