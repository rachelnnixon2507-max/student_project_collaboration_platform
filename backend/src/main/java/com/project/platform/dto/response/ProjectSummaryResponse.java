package com.project.platform.dto.response;

import com.project.platform.entity.enums.ProjectStatus;

import java.time.LocalDateTime;

public record ProjectSummaryResponse(
    Long id,
    String title,
    String description,
    String requiredSkills,
    ProjectStatus status,
    Long createdBy,
    String creatorName,
    String creatorEmail,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    int memberCount,
    int maxMembers,
    int availableSeats
) {}

