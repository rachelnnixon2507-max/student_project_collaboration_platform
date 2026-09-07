package com.project.platform.dto.response;

import com.project.platform.entity.enums.ProjectMemberRole;

import java.time.LocalDateTime;

public record ProjectMemberResponse(
    Long id,
    Long projectId,
    Long studentId,
    String studentName,
    String studentEmail,
    String department,
    String skills,
    ProjectMemberRole role,
    LocalDateTime joinedAt
) {}
