package com.project.platform.dto.response;

import com.project.platform.entity.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    Long userId,
    String title,
    String message,
    NotificationType type,
    boolean isRead,
    Long referenceId,
    String referenceType,
    LocalDateTime createdAt
) {}
