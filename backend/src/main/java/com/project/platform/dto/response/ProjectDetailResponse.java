package com.project.platform.dto.response;

import com.project.platform.entity.enums.JoinRequestStatus;
import com.project.platform.entity.enums.ProjectStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ProjectDetailResponse(
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
    List<ProjectMemberResponse> members,
    int memberCount,
    boolean isCurrentUserLeader,
    boolean isCurrentUserMember,
    JoinRequestStatus currentUserJoinRequestStatus,
    Long currentUserJoinRequestId
) {}
