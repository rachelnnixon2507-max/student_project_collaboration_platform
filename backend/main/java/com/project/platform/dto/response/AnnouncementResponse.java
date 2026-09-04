package com.project.platform.dto.response;

import com.project.platform.entity.enums.AnnouncementScope;

import java.time.LocalDateTime;

public record AnnouncementResponse(
    Long id,
    String title,
    String content,
    AnnouncementScope scope,
    Long projectId,
    Long createdBy,
    LocalDateTime createdAt
) {}
