package com.project.platform.dto.response;

import com.project.platform.entity.enums.JoinRequestStatus;

import java.time.LocalDateTime;

public record JoinRequestResponse(
    Long id,
    Long projectId,
    String projectTitle,
    Long studentId,
    String studentName,
    String studentEmail,
    String department,
    String skills,
    String message,
    JoinRequestStatus status,
    LocalDateTime createdAt,
    LocalDateTime respondedAt
) {}
